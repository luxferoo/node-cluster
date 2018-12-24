import cluster from 'cluster';
import os from 'os';
import fs from 'fs';
import path from 'path';

const wrap = (file)=>{
    if (cluster.isMaster) {
        const cpus = os.cpus().length;

        for (let i = 0; i < cpus; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            if (code !== 0 && !worker.exitedAfterDisconnect) {
                console.log(`Worker ${worker.id} crashed, Starting a new worker...`);
                cluster.fork();
            }
        });
        // print the master pid
        console.log(process.pid);
        //Running kill -SIGUSR2 [master_pid, example: 27386] will force all workers to restart
        process.on("SIGUSR2", () => {
            const workers = Object.values(cluster.workers);
            const restartWorker = (workerIndex) => {
                const worker = workers[workerIndex];
                if (!worker) return;
                worker.on('exit', () => {
                    if (!worker.exitedAfterDisconnect) return;
                    console.log(`Exited process ${worker.process.pid}`);
                    cluster.fork().on('listening', () => {
                        restartWorker(workerIndex + 1)
                    });
                });
                worker.disconnect();
            };
            restartWorker(0);
        })
    } else {
        require(file);
    }
};

if(!module.parent) {
    const appDir = path.dirname(require.main.filename);
    const file = path.join(appDir,'..', process.argv[2]);

    if (!fs.existsSync(file))
        throw new Error(`File not exist: ${ file }`);
    wrap(file);
}


export default wrap;
