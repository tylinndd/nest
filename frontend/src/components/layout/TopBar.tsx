import { Link } from "react-router-dom";

type Props = {
  showSaveExit?: boolean;
  right?: React.ReactNode;
};

export const TopBar = ({ showSaveExit, right }: Props) => (
  <header className="sticky top-0 z-30 bg-background/90 backdrop-blur border-b border-border/60">
    <div className="mx-auto max-w-md flex items-center justify-between px-5 py-4">
      <Link to="/" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-display text-lg">N</span>
        <span className="font-display text-xl text-primary">Nest</span>
      </Link>
      {showSaveExit ? (
        <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Save & Exit
        </Link>
      ) : (
        right
      )}
    </div>
  </header>
);
