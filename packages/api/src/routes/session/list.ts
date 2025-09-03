import z from "zod";

export const SessionListSchema = z.object({});

export const sessionList = async () => {
  return [
    {
      student: "Khaya Zulu",
      createdAt: "(GMT+02:00) Pretoria",
      title: "Advisor Session",
      advisor: "Rachel Chang",
    },
  ];
};
