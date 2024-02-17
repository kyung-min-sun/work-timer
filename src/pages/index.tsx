import { useEffect, useState } from "react";

import { FileField } from "~/components/fileField";
import Head from "next/head";
import { StyledButton } from "~/components/styledButton";
import { StyledContainer } from "~/components/container";

type TimeLog = {
  startTime: Date;
  endTime: Date;
  notes?: string;
};

export default function Home() {
  const [timerStartTime, setTimerStartTime] = useState<Date>();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [newLog, setNewLog] = useState<TimeLog>();
  const [logs, setLogs] = useState<TimeLog[]>();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 100);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (logs == undefined) {
      try {
        const items = localStorage.getItem("logs");
        if (!items) setLogs([]);
        else {
          const newLogs = JSON.parse(items) as TimeLog[];
          setLogs(newLogs ?? []);
        }
      } catch (e) {
        setLogs([]);
        console.log(e);
      }
    } else {
      try {
        localStorage.setItem("logs", JSON.stringify(logs));
      } catch (e) {
        console.log(e);
      }
    }
  }, [logs]);

  const formatMiliseconds = (miliseconds: number) => {
    const hours = Math.floor(miliseconds / (60 * 60 * 1000));
    const minutes =
      Math.floor((miliseconds % (60 * 60 * 1000)) / (60 * 1000)) % 60;
    const seconds = Math.floor((miliseconds % (60 * 60 * 1000)) / 1000) % 60;

    const padDigits = (number: number) =>
      number < 10 ? `0${number}` : number.toString();

    return `${padDigits(hours)}:${padDigits(minutes)}:${padDigits(seconds)}`;
  };

  const formatTime = (start: Date, end: Date) => {
    const diff = end.getTime() - start.getTime();
    return formatMiliseconds(diff);
  };

  const formatLogsToString = (logs: TimeLog[]) => {
    return JSON.stringify(logs);
  };

  const parseLogsFromFile = async (csvFile: File): Promise<TimeLog[]> => {
    return JSON.parse(await csvFile.text()) as TimeLog[];
  };

  // in case we don't deserialize the date properly from local storage
  const safeLogs =
    logs?.map((log) => ({
      ...log,
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime),
    })) ?? [];

  const today = new Date();
  const isSameDate = (d1: Date, d2: Date) =>
    d1.getFullYear() == d2.getFullYear() &&
    d1.getMonth() == d2.getMonth() &&
    d1.getDate() == d2.getDate();

  const timeWorkedToday = safeLogs
    .filter((log) => isSameDate(log.startTime, today))
    .reduce(
      (total, log) => total + (log.endTime.getTime() - log.startTime.getTime()),
      0,
    );

  const logsByDay = safeLogs.reduce(
    (days: { day: Date; logs: TimeLog[]; totalTime: number }[], timeLog) => {
      const lastDay = days[days.length - 1];
      const time = timeLog.endTime.getTime() - timeLog.startTime.getTime();
      if (
        days.length == 0 ||
        !lastDay ||
        !isSameDate(lastDay.day, timeLog.startTime)
      ) {
        return days.concat([
          {
            day: timeLog.startTime,
            logs: [timeLog],
            totalTime: time,
          },
        ]);
      }
      lastDay.logs.push(timeLog);
      lastDay.totalTime += time;
      return days;
    },
    [],
  );

  return (
    <>
      <Head>
        <title>Work Timer</title>
        <meta
          name="description"
          content="this is a work timer to measure how much i work"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold">Timer</h2>
          <StyledContainer>
            {!timerStartTime && !newLog && (
              <StyledButton onClick={() => setTimerStartTime(new Date())}>
                Start
              </StyledButton>
            )}
            {timerStartTime && (
              <>
                {currentTime > timerStartTime && (
                  <div className="font-medium">
                    {formatTime(timerStartTime, currentTime)}
                  </div>
                )}
                <StyledButton
                  onClick={() => {
                    setNewLog({
                      startTime: timerStartTime,
                      endTime: new Date(),
                    });
                    setTimerStartTime(undefined);
                  }}
                >
                  Stop
                </StyledButton>
              </>
            )}
            {newLog && (
              <>
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-medium">New Time Log</h3>
                  <div className="flex flex-row items-center gap-2">
                    <p className="font-semibold">
                      {formatTime(newLog.startTime, newLog.endTime)}
                    </p>
                    <p className="text-xs">
                      {newLog.endTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {newLog.startTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium">Note (Optional)</h4>
                    <textarea
                      className="resize-none rounded-md border bg-white/60 p-2 text-xs"
                      value={newLog.notes}
                      onChange={(e) =>
                        setNewLog({
                          ...newLog,
                          notes: e.target.value,
                        })
                      }
                    />
                  </p>
                  <StyledButton
                    onClick={() => {
                      setLogs((logs) => (logs ?? []).concat(newLog));
                      setNewLog(undefined);
                    }}
                  >
                    Save
                  </StyledButton>
                </div>
              </>
            )}
          </StyledContainer>
        </div>
        <StyledContainer>
          <h2 className="text-sm font-medium">Time Today</h2>
          <p className="text-md font-semibold">
            {formatMiliseconds(timeWorkedToday)}
          </p>
        </StyledContainer>
        <StyledContainer className="gap-2">
          <h2 className="text-sm font-medium">Past Logs</h2>
          <div className="flex flex-row items-center gap-2">
            <StyledButton
              className="text-xs"
              onClick={() => {
                const text = formatLogsToString(logs ?? []);
                const encodedUri = encodeURI(text);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "logs.json");
                link.click();
              }}
            >
              Download CSV
            </StyledButton>
            <StyledButton
              className="text-xs"
              onClick={() => {
                setLogs([]);
              }}
            >
              Clear
            </StyledButton>
            <FileField
              buttonClassName="bg-slate-300 hover:bg-slate-400/45 text-xs px-2 py-1"
              prompt={"Upload your file"}
              onUpload={async (file) => {
                try {
                  const uploadedLogs = await parseLogsFromFile(file);
                  setLogs((logs) => logs?.concat(uploadedLogs));
                } catch (e) {
                  alert(e);
                }
              }}
            />
          </div>
          <ul className="flex flex-col gap-4 py-2">
            {!logs && <li>None</li>}
            {logsByDay
              .sort(
                (l1, l2) =>
                  new Date(l2.day).getTime() - new Date(l1.day).getTime(),
              )
              .map((day, i) => (
                <li key={i}>
                  <div className="flex w-fit flex-row items-center gap-2 border-b">
                    <h4 className="text-md">
                      <span className="font-medium">
                        {formatMiliseconds(day.totalTime)}
                      </span>
                    </h4>
                    <h4 className="text-sm">
                      {day.day.toLocaleDateString("en-US")}
                    </h4>
                  </div>
                  <ul className="flex flex-col gap-2 py-2">
                    {day.logs
                      ?.sort(
                        (l1, l2) =>
                          new Date(l2.startTime).getTime() -
                          new Date(l1.startTime).getTime(),
                      )
                      .map((log, i) => (
                        <li
                          key={i}
                          className="flex flex-col gap-1 rounded-md bg-slate-300/70 p-2 text-xs"
                        >
                          <div className="flex flex-row items-center gap-2">
                            <p className="text-sm font-medium">
                              {formatTime(
                                new Date(log.startTime),
                                new Date(log.endTime),
                              )}
                            </p>
                            <p className="text-xs">
                              {log.endTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {log.startTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {log.notes && <p>{log.notes}</p>}
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
          </ul>
        </StyledContainer>
      </main>
    </>
  );
}
