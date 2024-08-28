import { ReadLine } from 'readline';

// readline/promises is not available in Node.js v14 and tsup has some problems with it
export const promptAndWaitForAnswer = async ({
  rl,
  question,
  resolver,
}: {
  rl: ReadLine;
  question: string;
  resolver: (input: string) => boolean;
}) => {
  return new Promise((resolve) => {
    rl.question(question, (answer: string) => {
      resolve(resolver(answer));
    });
  });
};
