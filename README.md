Please read the `README.md` file at https://github.com/ericchase-library/ts-library for more information.

Modify the `./tools/build.ts` before building.

Comment out all steps except one of the first two, depending on which os you use.

In example, for Linux:

```ts
...
builder.setAfterProcessingSteps(
  new (class implements Step {
    async end(builder: BuilderInternal) {}
    async run(builder: BuilderInternal) {
      await Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-linux-x64', './src/rmps.ts', '--outfile', './rmps'] }).run(builder);
      //await Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-windows-x64', './src/rmps.ts', '--outfile', './rmps.exe'] }).run(builder);
      //await Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-windows-x64', './src/rmps-windows.ts', '--outfile', './rmpsx.exe'] }).run(builder);
      // add icons
      //await Step_Bun_Run({ cmd: ['C:/@/Bin/ResourceHacker/default/ResourceHacker.exe', '-open', 'rmps.exe', '-save', 'rmps.exe', '-resource', 'bun.ico', '-action', 'addoverwrite', '-mask', 'ICONGROUP,MAINICON,'] }).run(builder);
      //await Step_Bun_Run({ cmd: ['C:/@/Bin/ResourceHacker/default/ResourceHacker.exe', '-open', 'rmpsx.exe', '-save', 'rmpsx.exe', '-resource', 'bun.ico', '-action', 'addoverwrite', '-mask', 'ICONGROUP,MAINICON,'] }).run(builder);
    }
  })(),
);
...
```

Then run `bun run build` to compile the executable.
