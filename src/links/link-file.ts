import fs from 'fs-extra';
import * as path from 'path';
import { AbstractVinyl } from '../consumer/component/sources';
import { AUTO_GENERATED_STAMP, AUTO_GENERATED_MSG } from '../constants';
import { PathOsBased } from '../utils/path';
import { BitId } from '../bit-id';
import logger from '../logger/logger';
import ValidationError from '../error/validation-error';

export default class LinkFile extends AbstractVinyl {
  override = false;
  ignorePreviousSymlink = false;
  writeAutoGeneratedMessage: boolean | null | undefined = true;
  srcPath: string | null | undefined; // existing path where the link is pointing to (needed for logging purposes)
  componentId: BitId | null | undefined; // needed for logging purposes

  async write(): Promise<string> {
    const stat = await this._getStatIfFileExists();
    if (stat) {
      if (!this.ignorePreviousSymlink && stat.isSymbolicLink()) {
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        throw new ValidationError(`fatal: trying to write a link file into a symlink file at "${this.path}"`);
      }
      if (!this.override) {
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        const fileContent = fs.readFileSync(this.path).toString();
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        if (!fileContent.includes(AUTO_GENERATED_STAMP)) return this.path;
      }
    }

    // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
    // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
    const data = this.writeAutoGeneratedMessage ? AUTO_GENERATED_MSG + this.contents : this.contents;
    // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
    logger.debug(`link-file.write, path ${this.path}`);
    try {
      // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
      await fs.outputFile(this.path, data);
    } catch (err) {
      if (err.code === 'EISDIR') {
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        logger.debug(`deleting a directory ${this.path} in order to write a link file with the same name`);
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        await fs.remove(this.path);
        // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
        await fs.outputFile(this.path, data);
      } else {
        throw err;
      }
    }

    // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
    return this.path;
  }

  static load({
    filePath,
    base,
    content,
    override = false,
    ignorePreviousSymlink = false,
    writeAutoGeneratedMessage = true,
    srcPath,
    componentId
  }: {
    filePath: PathOsBased;
    base?: string;
    content: string;
    override?: boolean;
    ignorePreviousSymlink?: boolean;
    writeAutoGeneratedMessage?: boolean;
    srcPath?: string;
    componentId?: BitId;
  }): LinkFile {
    // @ts-ignore AUTO-ADDED-AFTER-MIGRATION-PLEASE-FIX!
    const linkFile = new LinkFile({
      base: base || path.dirname(filePath),
      path: filePath,
      contents: Buffer.from(content)
    });
    linkFile.override = override;
    linkFile.writeAutoGeneratedMessage = writeAutoGeneratedMessage;
    linkFile.srcPath = srcPath;
    linkFile.componentId = componentId;
    linkFile.ignorePreviousSymlink = ignorePreviousSymlink;
    return linkFile;
  }
}
