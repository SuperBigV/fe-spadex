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

import moment from 'moment';

/**
 * 格式化日期时间
 * @param timestamp 时间戳（秒或毫秒）
 * @returns 格式化后的日期时间字符串，如 "2024-01-01 12:00:00"
 */
export const formatDateTime = (timestamp: number): string => {
  // 如果时间戳小于 10000000000，认为是秒级时间戳，需要转换为毫秒
  const msTimestamp = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  return moment(msTimestamp).format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 格式化日期
 * @param timestamp 时间戳（秒或毫秒）
 * @returns 格式化后的日期字符串，如 "2024-01-01"
 */
export const formatDate = (timestamp: number): string => {
  const msTimestamp = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  return moment(msTimestamp).format('YYYY-MM-DD');
};
