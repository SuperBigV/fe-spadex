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
import React, { useState } from 'react';
import { RightOutlined, DownOutlined } from '@ant-design/icons';
import classnames from 'classnames';

interface IProps {
  isActive?: boolean;
  header: React.ReactNode;
  children: React.ReactNode;
  extra?: React.ReactNode;
  isInner?: boolean;
}

export default function Panel(props: IProps) {
  const [isActive, setIsActive] = useState<boolean>(props.isActive || true);
  return (
    <div
      className={classnames({
        'spadex-collapse-item': true,
        'spadex-collapse-item-active': isActive,
        'spadex-collapse-item-inner': props.isInner,
      })}
    >
      <div
        className='spadex-collapse-header'
        onClick={() => {
          setIsActive(!isActive);
        }}
      >
        {isActive ? <DownOutlined className='spadex-collapse-arrow' /> : <RightOutlined className='spadex-collapse-arrow' />}
        {props.header}
        <div
          className='spadex-collapse-extra'
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
          }}
        >
          {props.extra}
        </div>
      </div>
      <div
        className={classnames({
          'spadex-collapse-content': true,
          'spadex-collapse-content-hidden': !isActive,
        })}
      >
        <div className='spadex-collapse-content-box'>{props.children}</div>
      </div>
    </div>
  );
}
