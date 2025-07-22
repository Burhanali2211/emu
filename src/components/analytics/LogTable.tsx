import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface LogTableProps {
  logs: string[];
}

export const LogTable: React.FC<LogTableProps> = ({ logs }) => {
  return (
    <div className="max-h-[400px] overflow-y-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Event</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log, index) => {
              const match = log.match(/\[(.*?)\]\s(.*)/);
              const timestamp = match ? match[1] : 'N/A';
              const message = match ? match[2] : log;
              return (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs text-slate-400">{timestamp}</TableCell>
                  <TableCell>{message}</TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={2} className="h-24 text-center text-slate-500">
                No logs to display.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
