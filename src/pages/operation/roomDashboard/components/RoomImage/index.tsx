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
 */

import React from 'react';
import { Skeleton } from 'antd';
import './index.less';

interface RoomImageProps {
  roomId: number | null;
  loading?: boolean;
}

const RoomImage: React.FC<RoomImageProps> = ({ roomId, loading }) => {
  if (loading) {
    return (
      <div className='room-image-container'>
        <Skeleton.Image active style={{ width: '100%', height: '100%' }} />
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className='room-image-container'>
        <div className='empty-placeholder'>请选择机房</div>
      </div>
    );
  }

  return (
    <div className='room-image-container'>
      <img src='/image/room.png' alt='机房3D图' />
    </div>
  );
};

export default RoomImage;

