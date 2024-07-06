import { renderToReadableStream } from "react-dom/server";

export const Home = ({ name }: { name: string }) => {
  return (
    <div
      style={{
        background: "lightblue",
      }}
    >
      <h1>Hello, {name}</h1>
    </div>
  );
};
