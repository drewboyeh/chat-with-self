import { useState, useMemo } from "react";
import { format, isToday, isYesterday, isThisWeek, parseISO } from "date-fns";
import { Search, Calendar, X, Filter, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

interface EntrySidebarProps {
  messages: Message[];
  onSelectEntry: (messageId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

type TimeFilter = "all" | "today" | "yesterday" | "week" | "month";

export function EntrySidebar({ messages, onSelectEntry, isOpen, onClose }: EntrySidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  // Group messages by date and extract user messages
  const groupedEntries = useMemo(() => {
    const userMessages = messages.filter((msg) => msg.role === "user");

    // Apply search filter
    let filtered = userMessages;
    if (searchQuery.trim()) {
      filtered = userMessages.filter((msg) =>
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply time filter
    const now = new Date();
    if (timeFilter !== "all") {
      filtered = filtered.filter((msg) => {
        const msgDate = parseISO(msg.created_at);
        switch (timeFilter) {
          case "today":
            return isToday(msgDate);
          case "yesterday":
            return isYesterday(msgDate);
          case "week":
            return isThisWeek(msgDate);
          case "month":
            const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return msgDate > monthAgo;
          default:
            return true;
        }
      });
    }

    // Group by date
    const grouped = filtered.reduce((acc, msg) => {
      const date = format(parseISO(msg.created_at), "yyyy-MM-dd");
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(msg);
      return acc;
    }, {} as Record<string, Message[]>);

    // Sort dates descending
    return Object.entries(grouped).sort(([a], [b]) => b.localeCompare(a));
  }, [messages, searchQuery, timeFilter]);

  const formatDateHeader = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    if (isThisWeek(date)) return format(date, "EEEE");
    return format(date, "MMM d, yyyy");
  };

  const getTruncatedContent = (content: string, maxLength = 60) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + "...";
  };

  const totalEntries = messages.filter((msg) => msg.role === "user").length;
  const filteredCount = groupedEntries.reduce((sum, [, msgs]) => sum + msgs.length, 0);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-80 bg-sidebar border-r border-sidebar-border z-50 transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sidebar-primary" />
              <h2 className="text-lg font-serif font-semibold text-sidebar-foreground">
                Entry History
              </h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="lg:hidden"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-sidebar-accent/50 border-sidebar-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-sidebar-accent rounded"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Time Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={timeFilter} onValueChange={(v) => setTimeFilter(v as TimeFilter)}>
              <SelectTrigger className="h-8 text-sm bg-sidebar-accent/50 border-sidebar-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {filteredCount} of {totalEntries} entries
            </span>
            {searchQuery && (
              <Badge variant="secondary" className="text-xs">
                Filtered
              </Badge>
            )}
          </div>
        </div>

        {/* Entries List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {groupedEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No entries found</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs text-primary hover:underline mt-2"
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              groupedEntries.map(([date, msgs]) => (
                <div key={date} className="space-y-2">
                  {/* Date Header */}
                  <div className="sticky top-0 bg-sidebar py-1.5 z-10">
                    <h3 className="text-xs font-semibold text-sidebar-primary uppercase tracking-wider">
                      {formatDateHeader(date)}
                    </h3>
                  </div>

                  {/* Messages for this date */}
                  <div className="space-y-2">
                    {msgs.map((msg) => (
                      <button
                        key={msg.id}
                        onClick={() => {
                          onSelectEntry(msg.id);
                          // Close sidebar on mobile after selection
                          if (window.innerWidth < 1024) {
                            onClose();
                          }
                        }}
                        className="w-full text-left p-3 rounded-lg bg-sidebar-accent/30 hover:bg-sidebar-accent transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm text-sidebar-foreground line-clamp-2 flex-1">
                            {getTruncatedContent(msg.content)}
                          </p>
                          <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(parseISO(msg.created_at), "h:mm a")}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
