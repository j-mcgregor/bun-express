import dts from "bun-plugin-dts";

await Bun.build({
  entrypoints: ["./src/app.ts"],
  outdir: "./dist",
  plugins: [dts()],
});
