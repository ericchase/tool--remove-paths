import { Path } from './lib/ericchase/Platform/FilePath.js';
import { getPlatformProvider } from './lib/ericchase/Platform/PlatformProvider.js';

const dirpath = Path(Bun.argv[2]);
const targetset = new Set<string>();
const ignoreset = new Set<string>();

// parse args
{
  let i = 3;
  for (; i < Bun.argv.length; i++) {
    if (Bun.argv[i] === '--') break;
    targetset.add(`**/${Path(Bun.argv[i]).standard}{,/**}`);
  }
  for (i++; i < Bun.argv.length; i++) {
    ignoreset.add(`**/${Path(Bun.argv[i]).standard}{,/**}`);
  }
}

if (targetset.size > 0) {
  console.log();
  console.log('Searching for...');
  console.log();
  for (const target of targetset) {
    console.log(target);
  }
  console.log();

  const platform = await getPlatformProvider('bun');
  const deleteset = new Set<string>();

  const tid = setInterval(() => {
    console.write('.');
  }, 1000);
  const dirlist = await Array.fromAsync(platform.Directory.globScan(dirpath, '**', true, false));
  clearInterval(tid);
  console.write('.');
  console.log();
  dirlist.sort();

  let previous = ' ';
  for (const path of dirlist) {
    let skip = false;
    for (const ignore of ignoreset) {
      if (platform.Utility.globMatch(path, ignore)) {
        skip = true;
        break;
      }
    }
    if (skip === false) {
      for (const target of targetset) {
        if (platform.Utility.globMatch(path, target)) {
          if (path.startsWith(previous) === false) {
            deleteset.add(path);
            previous = path;
          }
          break;
        }
      }
    }
  }

  if (deleteset.size > 0) {
    console.log();
    console.log('Marking for deletion...');
    console.log();
    for (const path of deleteset) {
      try {
        console.log((await platform.Path.isDirectory(Path(path))) ? 'Directory |' : 'File      |', path);
      } catch (error) {
        console.error(error);
      }
    }
    console.log();
    console.log(`${deleteset.size} paths marked for deletion.`);
    const response = prompt('\nType "yes" to delete paths: !DELETION IS PERMANENT! ');
    console.log();
    if (response === 'yes') {
      const tasks: Promise<void>[] = [];
      for (const path of deleteset) {
        tasks.push(
          (async () => {
            await platform.Directory.delete(Path(path));
            console.log('Deleted:', path);
          })(),
        );
      }
      await Promise.allSettled(tasks);
    } else {
      console.log('Aborted...');
    }
  } else {
    console.log();
    console.log('No paths marked for deletion.');
  }

  console.log('Done.');
} else {
  console.error(`Recursively search a directory for path patterns to delete.
Command: directory <target> -- <ignore>
  <target>    Path patterns to mark for deletion.
  <ignore>    Path patterns to ignore during search.

Please provide a directory path for searching and at least 1 target pattern.`);
}
