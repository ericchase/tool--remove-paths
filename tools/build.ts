import { Builder, BuilderInternal, Step } from './lib/Builder.js';
import { Step_Bun_Run } from './lib/steps/Bun-Run.js';
import { Step_CleanDirectory } from './lib/steps/FS-CleanDirectory.js';
import { Step_Format } from './lib/steps/FS-Format.js';

// Use command line arguments to set watch mode.
const builder = new Builder(Bun.argv[2] === '--watch' ? 'watch' : 'build');

// These steps are run during the startup phase only.
builder.setStartupSteps(
  Step_Bun_Run({ cmd: ['bun', 'install'] }, 'quiet'),
  Step_CleanDirectory(builder.dir.out),
  Step_Format('quiet'),
  //
);

// These steps are run before each processing phase.
builder.setBeforeProcessingSteps();

// The processors are run for every file that added them during every
// processing phase.
builder.setProcessorModules();

// These steps are run after each processing phase.
builder.setAfterProcessingSteps(
  new (class implements Step {
    async end(builder: BuilderInternal) {}
    async run(builder: BuilderInternal) {
      await Step_Bun_Run({ cmd: ['bun', 'build', '--compile', './src/rmds.ts'] }).run(builder);
    }
  })(),
);

// These steps are run during the shutdown phase only.
builder.setCleanupSteps();

await builder.start();
