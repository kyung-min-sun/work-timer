import { useEffect, useState } from "react";

import Head from "next/head";

type TimeLog = {
  startTime: Date;
  endTime: Date;
};

export default function Home() {
  const [timerState, setTimerState] = useState<
    TimeLog & {
      clicked: boolean;
    }
  >({
    startTime: new Date(),
    endTime: new Date(),
    clicked: false,
  });
  const [logs, setLogs] = useState<TimeLog[]>();

  useEffect(() => {
    const timer = setInterval(
      () =>
        setTimerState(({ clicked, startTime, endTime }) => ({
          clicked,
          startTime: !clicked
            ? new Date(startTime.getTime() + 1000)
            : startTime,
          endTime: clicked ? new Date(endTime.getTime() + 1000) : endTime,
        })),
      1000,
    );

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

  // in case we don't deserialize the date properly from local storage
  const safeLogs =
    logs?.map((log) => ({
      startTime: new Date(log.startTime),
      endTime: new Date(log.endTime),
    })) ?? [];

  const timeWorkedToday = safeLogs
    .filter(
      (log) => log.startTime.setHours(0, 0, 0) == new Date().setHours(0, 0, 0),
    )
    .reduce(
      (total, log) => total + (log.endTime.getTime() - log.startTime.getTime()),
      0,
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
      <main className="flex min-h-screen flex-col gap-8 p-4">
        <div className="flex flex-col gap-4">
          <h2 className="font-bold">Timer</h2>
          {!timerState.clicked && (
            <button
              className="border border-black p-2 font-medium"
              onClick={() =>
                setTimerState(() => ({
                  startTime: new Date(),
                  endTime: new Date(),
                  clicked: true,
                }))
              }
            >
              Start
            </button>
          )}
          {timerState.clicked && (
            <>
              <div className="font-medium">
                {formatTime(timerState.startTime, timerState.endTime)}
              </div>
              <button
                className="border border-black p-2 font-medium"
                onClick={() => {
                  setTimerState((timerState) => {
                    setLogs((logs) => (logs ?? []).concat(timerState));
                    return {
                      startTime: new Date(),
                      endTime: new Date(),
                      clicked: false,
                    };
                  });
                }}
              >
                Stop
              </button>
            </>
          )}
        </div>
        <div>
          <h2 className="font-bold">Total Time Worked Today</h2>
          <p>Total: {formatMiliseconds(timeWorkedToday)}</p>
        </div>
        <div>
          <h2 className="font-bold">Past Logs</h2>
          <ul className="flex flex-col gap-2">
            {!logs && <li>None</li>}
            {logs
              ?.sort(
                (l1, l2) =>
                  new Date(l2.startTime).getTime() -
                  new Date(l1.startTime).getTime(),
              )
              .map((log, i) => (
                <li key={i}>
                  <p>
                    Total:{" "}
                    {formatTime(new Date(log.startTime), new Date(log.endTime))}
                  </p>
                  <p>End: {new Date(log.endTime).toLocaleString("en-US")}</p>
                  <p>
                    Start: {new Date(log.startTime).toLocaleString("en-US")}
                  </p>
                </li>
              ))}
          </ul>
        </div>
      </main>
    </>
  );
}
