import { Path } from './lib/ericchase/Platform/FilePath.js';
import { getPlatformProvider } from './lib/ericchase/Platform/PlatformProvider.js';

const [, , ...args] = Bun.argv;

const platform = await getPlatformProvider('bun');

for await (const path of platform.Directory.globScan(Path(args[0]), '**', true, false)) {
  console.log(path);
}

// if (args[0]) {
//   const pathset = new Set(pathlist);
//   // const tid = setInterval(() => {}, 1000);
//   const tasks: Promise<void>[] = [];
//   for (const path of pathset) {
//     tasks.push(
//       (async () => {
//         await platform.Directory.delete(Path(path));
//         console.log('Deleted:', path);
//       })(),
//     );
//   }
//   await Promise.allSettled(tasks);
// } else {
//   console.log('Supply a directory path. ("." for current directory)');
// }
