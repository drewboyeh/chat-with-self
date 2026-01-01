-- Piece-Based Progressive Art System
-- Art pieces are made up of multiple "pieces" that reveal as goals progress
-- Run this in your Supabase SQL Editor

-- Update art_pieces table to support piece-based system
ALTER TABLE public.art_pieces 
ADD COLUMN IF NOT EXISTS total_pieces INTEGER DEFAULT 1 CHECK (total_pieces > 0),
ADD COLUMN IF NOT EXISTS revealed_pieces INTEGER DEFAULT 0 CHECK (revealed_pieces >= 0 AND revealed_pieces <= total_pieces),
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false, -- For social sharing
ADD COLUMN IF NOT EXISTS piece_data JSONB, -- Stores all individual piece definitions
ADD COLUMN IF NOT EXISTS revealed_piece_indices INTEGER[] DEFAULT ARRAY[]::INTEGER[]; -- Which pieces are currently revealed

-- Create art_piece_components table to store individual pieces
CREATE TABLE IF NOT EXISTS public.art_piece_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  art_piece_id UUID NOT NULL REFERENCES public.art_pieces(id) ON DELETE CASCADE,
  piece_index INTEGER NOT NULL CHECK (piece_index >= 0), -- 0-based index
  component_data JSONB NOT NULL, -- Individual piece SVG/art definition
  grandeur_level TEXT NOT NULL DEFAULT 'small' CHECK (grandeur_level IN ('tiny', 'small', 'medium', 'large', 'grand', 'epic')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(art_piece_id, piece_index)
);

-- Enable RLS for art_piece_components
ALTER TABLE public.art_piece_components ENABLE ROW LEVEL SECURITY;

-- RLS Policies for art_piece_components
DROP POLICY IF EXISTS "Users can view their own art piece components" ON public.art_piece_components;
CREATE POLICY "Users can view their own art piece components" 
ON public.art_piece_components FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.art_pieces 
    WHERE art_pieces.id = art_piece_components.art_piece_id 
    AND art_pieces.user_id = auth.uid()
  )
);

-- Public viewing policy (for social features)
DROP POLICY IF EXISTS "Public can view shared art piece components" ON public.art_piece_components;
CREATE POLICY "Public can view shared art piece components" 
ON public.art_piece_components FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.art_pieces 
    WHERE art_pieces.id = art_piece_components.art_piece_id 
    AND art_pieces.is_public = true
  )
);

-- Update RLS policies for art_pieces to support public viewing
DROP POLICY IF EXISTS "Public can view shared art pieces" ON public.art_pieces;
CREATE POLICY "Public can view shared art pieces" 
ON public.art_pieces FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_art_piece_components_art_piece_id ON public.art_piece_components(art_piece_id);
CREATE INDEX IF NOT EXISTS idx_art_piece_components_piece_index ON public.art_piece_components(art_piece_id, piece_index);
CREATE INDEX IF NOT EXISTS idx_art_pieces_is_public ON public.art_pieces(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_art_pieces_total_pieces ON public.art_pieces(total_pieces);

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';

