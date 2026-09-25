import { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { AvatarUpload } from '@/components/AvatarUpload';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  LogOut,
  Sparkles,
  User,
} from 'lucide-react';

interface NavbarProps {
  session: Session;
  avatarUrl: string | null;
  onAvatarUpdated: (url: string) => void;
  shouldCrash?: boolean;
}

export function Navbar({
  session,
  avatarUrl,
  onAvatarUpdated,
  shouldCrash = false,
}: NavbarProps) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  // Deliberate crash guard for ErrorBoundary audit testing
  if (shouldCrash) {
    throw new Error('Simulated runtime failure in Navigation Bar (Audit Checklist Test)');
  }

  const userEmail = session.user.email || 'User';

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:backdrop-blur-md">
      <div className="max-w-4xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className='text-black'>
            <h1 className="text-base font-bold tracking-tight text-black leading-non">
              Habit Tracker
            </h1>
            <span className="text-[11px] text-muted-foreground">Personal Momentum</span>
          </div>
        </div>

        {/* User Controls */}
        <div className="flex items-center gap-3">
          {/* Avatar & Profile Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger render={
              <button
                type="button"
                className="flex items-center gap-2 rounded-full p-1 transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                title="Manage Avatar"
              >
                <div className="relative h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <span className="hidden sm:inline-block text-xs font-medium text-muted-foreground max-w-[140px] truncate">
                  {userEmail}
                </span>
              </button>
            } />

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Profile Avatar</DialogTitle>
                <DialogDescription>
                  Choose a picture to personalize your habit tracker. Maximum file size is 1 MB.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <AvatarUpload
                  session={session}
                  currentAvatarUrl={avatarUrl}
                  onAvatarUpdated={(newUrl) => {
                    onAvatarUpdated(newUrl);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => supabase.auth.signOut()}
            className="gap-1.5 text-xs text-red-600 hover:bg-red-600 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
