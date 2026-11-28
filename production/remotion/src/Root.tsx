import { W01Graphics } from "./w01/W01";
import { W01EditComposition } from "./w01/edit/W01Edit";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <W01Graphics />
      <W01EditComposition />
    </>
  );
};
