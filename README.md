# node-cluster
clustering and 0 downtime (using babel/es6)

# via import

```node
import cluster from './cluster';
import path from 'path';

cluster(path.join(__dirname,'file_to_use'));
 
```
# via cli

```
babel-node cluster file_to_use
```
