import React from 'react';

export default function PlusePlaceholder() {
  return null;
}

function AlertRule() {
  return null;
}

function QueryBuilder() {
  return null;
}

function datasource() {}

function Event() {
  return null;
}

function EventLogs() {
  return null;
}

function EventPreview() {
  return null;
}

function Explorer() {
  return null;
}

function Jobs() {
  return null;
}

// plus 版会在 plus:/parcels/AlertRule/utils 导出以下方法；
// 非 plus 版本用占位实现以保证打包通过。
function processFormValues(values: any) {
  return values;
}

function processInitialValues(values: any) {
  return values;
}

const advancedCates = [];
const envCateMap = {};
enum AdvancedDatasourceCateEnum {}
const getLicense = async () => {
  return {};
};
const getspadexConfig = async () => {
  return {};
};
const getDefaultValuesByCate = () => {};
const autoDatasourcetype = [];
const AuthList = [];
const extraColumns = () => {};
const getNetworkDevices = () => {};
const getNetworkDevicesList = () => {};
const getNetworkDevicesTags = () => {};
const proDocumentPathMap = {};
export {
  AlertRule,
  QueryBuilder,
  datasource,
  Event,
  EventLogs,
  EventPreview,
  Explorer,
  Jobs,
  processFormValues,
  processInitialValues,
  advancedCates,
  envCateMap,
  AdvancedDatasourceCateEnum,
  getLicense,
  getspadexConfig,
  getDefaultValuesByCate,
  autoDatasourcetype,
  AuthList,
  extraColumns,
  getNetworkDevices,
  getNetworkDevicesList,
  getNetworkDevicesTags,
  proDocumentPathMap,
};
