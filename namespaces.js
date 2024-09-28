

import * as fs from 'node:fs/promises';

class Process {
  constructor(pid) {
    this.pid = pid;
  }

  async getProcessPids() {
    const fh = await fs.open(`/proc/${this.pid}/status`);
    console.log(`pid = ${this.pid}`)
    let pids;
    for await (const line of fh.readLines()) {
      if (line.startsWith('NSpid')) {
        pids = line.split(':').at(1).trim().split(' ')
      }
    }
    return pids;
  }

  async getPidNs() {
    return await fs.readlink(`/proc/${this.pid}/ns/pid`)
  }
}

async function main() {

  try {
    const dir = await fs.opendir('/proc');
    for await (const dirent of dir) {
      const fileName = dirent.name
      if (IsInt(fileName)) {
        const pid = parseInt(fileName)
        const proc = new Process(pid);
        console.log(`${await proc.getPidNs()} ${proc.pid}`)
      }
    }
  } catch (err) {
    console.error(err);
  }

}


function IsInt(fileName) {
  const pid = parseInt(fileName)
  if (isNaN(pid)) {
    return false;
  }
  return true;
}

await main()
