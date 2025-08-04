import { BunPlatform_Glob_Match } from './lib/ericchase/BunPlatform_Glob_Match.js';
import { Async_BunPlatform_Glob_Scan_Generator } from './lib/ericchase/BunPlatform_Glob_Scan_Generator.js';
import { NODE_PATH } from './lib/ericchase/NodePlatform.js';
import { Async_NodePlatform_Directory_Delete } from './lib/ericchase/NodePlatform_Directory_Delete.js';
import { Async_NodePlatform_Path_Is_Directory } from './lib/ericchase/NodePlatform_Path_Is_Directory.js';
import { NodePlatform_PathObject_Relative_Class } from './lib/ericchase/NodePlatform_PathObject_Relative_Class.js';

const dirpath = NODE_PATH.join(Bun.argv[2] ?? '');
const targetset = new Set<string>();
const ignoreset = new Set<string>();

// parse args
{
  let i = 3;
  for (; i < Bun.argv.length; i++) {
    if (Bun.argv[i] === '--') break;
    targetset.add(`**/${NodePlatform_PathObject_Relative_Class(Bun.argv[i]).toPosix().join()}{,/**}`);
  }
  for (i++; i < Bun.argv.length; i++) {
    ignoreset.add(`**/${NodePlatform_PathObject_Relative_Class(Bun.argv[i]).toPosix().join()}{,/**}`);
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

  const deleteset = new Set<string>();

  const tid = setInterval(() => {
    console.write('.');
  }, 1000);
  const dirlist = await Array.fromAsync(Async_BunPlatform_Glob_Scan_Generator(dirpath, '**', { absolute_paths: true, only_files: false }));
  clearInterval(tid);
  console.write('.');
  console.log();
  dirlist.sort();

  let previous = ' ';
  for (const path of dirlist) {
    let skip = false;
    for (const ignore of ignoreset) {
      if (BunPlatform_Glob_Match(path, ignore)) {
        skip = true;
        break;
      }
    }
    if (skip === false) {
      for (const target of targetset) {
        if (BunPlatform_Glob_Match(path, target)) {
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
        console.log((await Async_NodePlatform_Path_Is_Directory(path)) ? 'Directory |' : 'File      |', path);
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
            await Async_NodePlatform_Directory_Delete(path, true);
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
