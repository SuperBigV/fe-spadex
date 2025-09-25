const zh_CN = {
  user: {
    title: '用户管理',
    search_placeholder: '用户名、邮箱或手机',
    create: '创建用户',
    edit: '编辑用户',
    busi_groups: '业务组',
    user_groups: '团队',
    last_active_time: '最后活跃时间',
  },
  team: {
    title: '团队管理',
    list: '团队列表',
    search_placeholder: '用户名、显示名、邮箱或手机',
    create: '创建团队',
    edit: '编辑团队',
    add_member: '添加成员',
    empty: '没有与您相关的团队，请先',
    name: '团队名称',
    add_member_selected: '已选择 {{num}} 项',
  },
  business: {
    title: '分组管理',
    list: '业务组',
    search_placeholder: '业务名',
    team_search_placeholder: '搜索团队名称',
    create: '创建业务组',
    edit: '编辑业务组',
    add_team: '添加团队',
    perm_flag: '权限',
    note_content: '告警规则，告警事件，监控对象，自愈脚本等都归属业务组，是一个在系统里可以自闭环的组织',
    empty: '业务组（监控对象、监控仪表盘、告警规则、自愈脚本都要归属某个业务组）为空，请先',
    name: '业务组名称',
    name_tip: `
      通过 {{separator}} 分隔后会渲染成树结构 <1 />
      如：华为{{separator}}S5800 和 华为{{separator}}S8600 将显示成如下  <1 />
      华为 <1 />
      - S5800 <1 />
      - S8600 <1 />
    `,
    team_name: '团队',
    perm_flag_0: '只读',
    perm_flag_1: '读写',
    user_group_msg: '业务组团队不能为空',
  },
  model: {
    name: '型号名称',
    title: '设备型号',
    list: '已适配型号',
    search_placeholder: '型号',
    oid_search_placeholder: '搜索指标名称',
    create: '创建型号',
    add_metric: '添加指标',
    edit_metric: '编辑指标',
    edit: '编辑',
    note_content: '适配服务器，交换机，存储设备等可通过SNMP采集的硬件设备,基于供应商提供的不同设备型号管理指标OID',
    name_tip: `
    通过 {{separator}} 分隔后会渲染成树结构 <1 />
    如：华为{{separator}}S5800 和 华为{{separator}}S8600 将显示成如下  <1 />
    华为 <1 />
    - S5800 <1 />
    - S8600 <1 />
  `,
  },
  disbale: '禁用',
  enable: '启用',
  ok_and_search: '确定并搜索',
};
export default zh_CN;
