
import * as TE from 'fp-ts/TaskEither'
import * as E from 'fp-ts/Either'

import fs from 'fs';
import { promisify } from 'util';


const readFromFile = promisify(fs.readFile);
export  const getFileContents = (path: string) => TE.tryCatch(() => readFromFile(path, 'utf-8'), E.toError);
