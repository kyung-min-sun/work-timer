import {
  AccessTime,
  Delete,
  DeleteOutline,
  Download,
} from "@mui/icons-material";
import { useEffect, useState } from "react";

import Head from "next/head";
import { StyledButton } from "~/components/styledButton";
import { StyledContainer } from "~/components/container";
import { UploadFileButton } from "~/components/fileField";

type TimeLog = {
  startTime: Date;
  endTime: Date;
  labels?: string[];
  notes?: string;
};

export default function Home() {
  const [timerStartTime, setTimerStartTime] = useState<Date>();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const [newLog, setNewLog] = useState<TimeLog>();
  const [newLabel, setNewLabel] = useState<string>();

  const [logs, setLogs] = useState<TimeLog[]>();
  const [labels, setLabels] = useState<string[]>();

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 100);
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (labels == undefined) {
      try {
        const items = localStorage.getItem("labels");
        if (!items) setLabels([]);
        else {
          const newLabels = JSON.parse(items) as string[];
          setLabels(newLabels ?? []);
        }
      } catch (e) {
        setLabels([]);
      }
    } else {
      try {
        localStorage.setItem("labels", JSON.stringify(labels));
      } catch (e) {
        console.log(e);
      }
    }
  }, [labels]);

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
        <title>work timer</title>
        <meta
          name="description"
          content="this is a work timer to measure how much i work"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          <div className="flex w-fit flex-row items-center gap-2 rounded-md bg-slate-200 p-2">
            <AccessTime />
            <h1 className="font-medium">work</h1>
          </div>
          <StyledContainer>
            {!timerStartTime && !newLog && (
              <StyledButton onClick={() => setTimerStartTime(new Date())}>
                start
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
                  stop
                </StyledButton>
              </>
            )}
            {newLog && (
              <>
                <div className="flex flex-col gap-4">
                  <h3 className="text-sm font-medium">new time log</h3>
                  <div className="flex flex-row items-center gap-2">
                    <p className="font-semibold">
                      {formatTime(newLog.startTime, newLog.endTime)}
                    </p>
                    <p className="text-xs">
                      {newLog.startTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -{" "}
                      {newLog.endTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <p className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium">note (optional)</h4>
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
                  <p className="flex flex-col gap-2">
                    <h4 className="text-xs font-medium">label</h4>
                    <div className="flex flex-col gap-4">
                      <select
                        className="w-fit rounded-md px-2 py-1 text-xs"
                        onChange={(e) => {
                          console.log(e.currentTarget.value);
                          setNewLog({
                            ...newLog,
                            labels: (newLog.labels ?? []).concat(
                              e.currentTarget.value,
                            ),
                          });
                        }}
                      >
                        <option>---</option>
                        {labels?.map((label) => (
                          <option key={label}>{label}</option>
                        ))}
                      </select>
                      <div className="flex flex-row items-center gap-2">
                        {newLog.labels?.map((label) => (
                          <div
                            key={label}
                            className="flex flex-row items-center gap-2 rounded-md bg-slate-300 p-2 text-xs"
                          >
                            <span>{label}</span>
                            <button
                              onClick={() =>
                                setNewLog({
                                  ...newLog,
                                  labels: labels?.filter((l) => l !== label),
                                })
                              }
                            >
                              <Delete fontSize="small" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </p>
                  <StyledButton
                    onClick={() => {
                      setLogs((logs) => (logs ?? []).concat(newLog));
                      setNewLog(undefined);
                    }}
                  >
                    save
                  </StyledButton>
                </div>
              </>
            )}
          </StyledContainer>
        </div>
        <StyledContainer>
          <h2 className="text-sm font-medium">labels</h2>
          <div className="mb-2 flex flex-row gap-2">
            {labels?.map((label) => (
              <div
                key={label}
                className="flex flex-row items-center gap-2 rounded-md bg-slate-300 p-2 text-xs"
              >
                <span>{label}</span>
                <button
                  onClick={() =>
                    setLabels((labels) => labels?.filter((l) => l !== label))
                  }
                >
                  <Delete fontSize="small" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-row gap-2">
            <input
              className="rounded-md p-2 text-xs"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
            />
            <StyledButton
              className="text-xs"
              onClick={() => {
                if (newLabel && newLabel.length > 0) {
                  setLabels((labels) => (labels ?? []).concat(newLabel));
                  setNewLabel("");
                }
              }}
            >
              Create
            </StyledButton>
          </div>
        </StyledContainer>
        <StyledContainer>
          <h2 className="text-sm font-medium">time today</h2>
          <p className="text-md font-semibold">
            {formatMiliseconds(timeWorkedToday)}
          </p>
        </StyledContainer>
        <StyledContainer className="gap-2">
          <h2 className="text-sm font-medium">past logs</h2>
          <div className="flex flex-row items-center gap-2">
            <StyledButton
              onClick={() => {
                const text = formatLogsToString(logs ?? []);
                console.log(text);
                const encodedUri = encodeURI(
                  "data:text/json;charset=utf-8," + text,
                );
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "logs.json");
                link.click();
              }}
            >
              <Download fontSize="small" />
            </StyledButton>
            <UploadFileButton
              onUpload={async (files) => {
                try {
                  const uploadedLogs = await Promise.all(
                    files.map((file) => parseLogsFromFile(file)),
                  );
                  setLogs((logs) => logs?.concat(uploadedLogs.flat()));
                } catch (e) {
                  alert(e);
                }
              }}
            />
            <div className="flex flex-1 flex-row place-content-end">
              <StyledButton
                onClick={() => {
                  setLogs([]);
                }}
              >
                <DeleteOutline fontSize="small" />
              </StyledButton>
            </div>
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
                          className="flex flex-col gap-2 rounded-md bg-slate-300/70 p-2 text-xs"
                        >
                          <div className="flex flex-row items-center gap-2">
                            <p className="text-sm font-medium">
                              {formatTime(
                                new Date(log.startTime),
                                new Date(log.endTime),
                              )}
                            </p>
                            <p className="text-xs">
                              {log.startTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}{" "}
                              -{" "}
                              {log.endTime.toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          {log.notes && <p>{log.notes}</p>}
                          {log.labels && (
                            <div className="flex flex-row items-center gap-2">
                              {log.labels.map((label, i) => (
                                <div
                                  key={i}
                                  className="rounded-md border border-slate-700 px-2 py-1 text-slate-700"
                                >
                                  {label}
                                </div>
                              ))}
                            </div>
                          )}
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
