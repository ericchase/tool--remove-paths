import { Path } from './lib/ericchase/Platform/FilePath.js';
import { getPlatformProvider } from './lib/ericchase/Platform/PlatformProvider.js';

const [, , ...args] = Bun.argv;

const platform = await getPlatformProvider('bun');
const pathlist = (await Array.fromAsync(await platform.Directory.globScan(Path(args[0]), '**', true, false))).reverse();

if (args[0]) {
  const pathset = new Set(pathlist);
  // const tid = setInterval(() => {}, 1000);
  const tasks: Promise<void>[] = [];
  for (const path of pathset) {
    tasks.push(
      (async () => {
        await platform.Directory.delete(Path(path), true);
        console.log('Deleted:', path);
      })(),
    );
  }
  await Promise.allSettled(tasks);
} else {
  console.log('Supply a directory path. ("." for current directory)');
}
