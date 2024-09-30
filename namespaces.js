

import * as fs from 'node:fs/promises';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const ioctl = require('./build/ioctl_js');

class Pids {
  constructor() {
    this.pids = new Map()
  }

  insert(pid) {
    this.pids.set(pid, new Process(pid))
  }

  async buildPidNsGraph() {
    const nsToPidList = new Map()
    const assertNsIsPid = async function(proc) {
      const fh = await fs.open(proc.getPidNsPath())
      let ret = ioctl.ioctl(fh.fd, ioctl.NS_GET_NSTYPE)
      if (ioctl.CLONE_NEWPID != ret) {
        console.log(ret)
        throw new Error("got unexpected namespace")
      }
      fh.close()
    }
    for (const [pid, proc] of this.pids) {
      const ns = await proc.getPidNs()
      if (!nsToPidList.has(ns)) {
        nsToPidList.set(ns, [])
      }
      const nsList = nsToPidList.get(ns);
      nsList.push(proc)
      await assertNsIsPid(proc)
    }
    this.nsToPidList = nsToPidList
    const nsToParentNs = new Map()
    for (const ns of this.nsToPidList) {
      const ppid = await this.nsToPidList.get(ns[0])[0].getPpid()
      if (ppid != 0) {
        nsToParentNs[ns[0]] = await (new Process(ppid)).getPidNs()
      }
    }
    this.nsToParentNs = nsToParentNs
  }

}

class Process {
  constructor(pid) {
    this.pid = pid;
  }

  // A process has a different pid for every namespace it's in.
  // The list of all its PIDs are found in the NSPid field of
  // /proc/<pid>/status.
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

  // Get the namespace for this pid.
  async getPidNs() {
    return await fs.readlink(`/proc/${this.pid}/ns/pid`)
  }

  getPidNsPath() {
    return `/proc/${this.pid}/ns/pid`
  }

  // Get the pid of the parent process.
  async getPpid() {
    const fh = await fs.open(`/proc/${this.pid}/status`);
    for await (const line of fh.readLines()) {
      if (line.startsWith('PPid')) {
        let ppid = line.split(':').at(1).trim()
        fh.close()
        return ppid
      }
    }
    throw new Error('PPid field not found in /proc/<pid>/status')
  }
}

async function main() {

  const pids = new Pids()

  try {
    const dir = await fs.opendir('/proc');
    for await (const dirent of dir) {
      const fileName = dirent.name
      if (IsInt(fileName)) {
        const pid = parseInt(fileName)
        pids.insert(pid)
      }
    }
    pids.buildPidNsGraph()

  } catch (err) {
    console.error(err);
    return
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
