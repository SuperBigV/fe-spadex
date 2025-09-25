/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import _ from 'lodash';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

export const createSSHSession = (data) => {
  return request(`/cmdb/term/ssh/session`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const createTelnetSession = (data) => {
  return request(`/cmdb/term/telnet/session`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Get file list from remote server using SFTP protocol.
 *
 * @param {Object} params - Request parameters.
 * @param {string} params.path - Remote path.
 * @param {string} params.session_id - Session ID.
 * @return {Promise<Object[]>} - File list.
 */
/*******  83fef5d4-8663-440e-817a-32711e90ebd4  *******/ export const sftpFileList = (params) => {
  return request(`/cmdb/term/sftp/list`, {
    method: RequestMethod.Get,
    params,
  }).then((res) => res.dat);
};

export const sftpCreateDirApi = (data) => {
  return request(`/cmdb/term/sftp/createDir`, {
    method: RequestMethod.Post,
    data,
  }).then((res) => res.dat);
};

export const downloadSftpFile = (params) => {
  return request(`/cmdb/term/sftp/download`, {
    method: RequestMethod.Get,
    responseType: 'blob',
    params,
  }).then((res) => res);
};

export const sftpDeleteFileApi = (params) => {
  return request(`/cmdb/term/sftp/delete`, {
    method: RequestMethod.Delete,
    params,
  }).then((res) => res.dat);
};
