import { BunPlatform_Args_Has } from '../src/lib/ericchase/BunPlatform_Args_Has.js';
import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Update_Config } from './core-dev/step/Step_Dev_Project_Update_Config.js';
import { Builder } from './core/Builder.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';
import { Step_FS_Clean_Directory } from './core/step/Step_FS_Clean_Directory.js';
import { Step_Sync } from './core/step/Step_Sync.js';

if (BunPlatform_Args_Has('--dev')) {
  Builder.SetMode(Builder.MODE.DEV);
}
Builder.SetVerbosity(Builder.VERBOSITY._1_LOG);

Builder.SetStartUpSteps(
  Step_Dev_Project_Update_Config({ project_path: './' }),
  Step_Bun_Run({ cmd: ['bun', 'update', '--latest'], showlogs: false }),
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_FS_Clean_Directory(Builder.Dir.Out),
  Step_Dev_Format({ showlogs: false }),
  //
);

Builder.SetAfterProcessingSteps(
  Step_Sync([
    Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-linux-x64', './src/rmps.ts', '--outfile', './rmps'] }),
    Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-windows-x64', './src/rmps.ts', '--outfile', './rmps.exe'] }),
    Step_Bun_Run({ cmd: ['bun', 'build', '--compile', '--target', 'bun-windows-x64', './src/rmpsx.ts', '--outfile', './rmpsx.exe'] }),
    // add icons
    Step_Bun_Run({ cmd: ['C:/@/Bin/ResourceHacker/default/ResourceHacker.exe', '-open', 'rmps.exe', '-save', 'rmps.exe', '-resource', 'bun.ico', '-action', 'addoverwrite', '-mask', 'ICONGROUP,MAINICON,'] }),
    Step_Bun_Run({ cmd: ['C:/@/Bin/ResourceHacker/default/ResourceHacker.exe', '-open', 'rmpsx.exe', '-save', 'rmpsx.exe', '-resource', 'bun.ico', '-action', 'addoverwrite', '-mask', 'ICONGROUP,MAINICON,'] }),
  ]),
  //
);

await Builder.Start();
