# 合作单位管理模块 - 后端开发计划

## 一、项目概述

### 1.1 功能目标

- 提供采购供应商的完整数据模型和 API 接口
- 提供维保单位的完整数据模型和 API 接口
- 支持数据的增删改查操作
- 支持搜索、筛选、分页等查询功能
- 提供数据验证和错误处理
- 支持批量操作功能

### 1.2 技术栈

- 语言: Go 1.23.10
- 数据库: MySQL
- Web 框架: 待定（Gin/Echo/Iris 等，需根据项目现有框架选择）
- ORM: GORM
- 验证库: 待定（validator/v10 等）

### 1.3 开发周期

预计开发周期: **2-3 周**

---

## 二、数据模型设计

### 2.1 核心实体

#### 2.1.1 采购供应商 (Supplier)

```go
type Supplier struct {
    ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
    Name            string    `gorm:"type:varchar(100);not null;comment:供应商名称" json:"name"`
    Contact         string    `gorm:"type:varchar(50);not null;comment:联系人" json:"contact"`
    Phone           string    `gorm:"type:varchar(20);not null;comment:联系电话" json:"phone"`
    Email           string    `gorm:"type:varchar(100);comment:联系邮箱" json:"email"`
    Address         string    `gorm:"type:varchar(200);comment:地址" json:"address"`
    Type            string    `gorm:"type:varchar(20);not null;comment:供应商类型(设备供应商/服务供应商/综合供应商)" json:"type"`
    CooperationDate time.Time `gorm:"type:date;not null;comment:合作日期" json:"cooperationDate"`
    Remark          string    `gorm:"type:text;comment:备注" json:"remark"`
    CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (Supplier) TableName() string {
    return "partner_suppliers"
}
```

**字段说明：**

- `ID`: 主键，自增
- `Name`: 供应商名称，必填，最大长度 100
- `Contact`: 联系人，必填，最大长度 50
- `Phone`: 联系电话，必填，最大长度 20
- `Email`: 联系邮箱，选填，最大长度 100，需验证邮箱格式
- `Address`: 地址，选填，最大长度 200
- `Type`: 供应商类型，必填，枚举值：设备供应商、服务供应商、综合供应商
- `CooperationDate`: 合作日期，必填，日期类型
- `Remark`: 备注，选填，文本类型
- `CreatedAt`: 创建时间，自动生成
- `UpdatedAt`: 更新时间，自动更新
- `DeletedAt`: 软删除标记

**索引设计：**

- 主键索引：`ID`
- 唯一索引：`Name`（可选，根据业务需求决定是否允许重名）
- 普通索引：`Type`、`CooperationDate`、`DeletedAt`

#### 2.1.2 维保单位 (Maintenance)

```go
type Maintenance struct {
    ID              int64     `gorm:"primaryKey;autoIncrement" json:"id"`
    Name            string    `gorm:"type:varchar(100);not null;comment:单位名称" json:"name"`
    Contact         string    `gorm:"type:varchar(50);not null;comment:联系人" json:"contact"`
    Phone           string    `gorm:"type:varchar(20);not null;comment:联系电话" json:"phone"`
    Email           string    `gorm:"type:varchar(100);comment:联系邮箱" json:"email"`
    Address         string    `gorm:"type:varchar(200);comment:地址" json:"address"`
    Type            string    `gorm:"type:varchar(20);not null;comment:维保类型(硬件维保/软件维保/综合维保/应急响应)" json:"type"`
    CooperationDate time.Time `gorm:"type:date;not null;comment:合作日期" json:"cooperationDate"`
    Duration        int       `gorm:"type:int;not null;comment:维保时长(月)" json:"duration"`
    CreatedAt       time.Time `gorm:"autoCreateTime" json:"createdAt"`
    UpdatedAt       time.Time `gorm:"autoUpdateTime" json:"updatedAt"`
    DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (Maintenance) TableName() string {
    return "partner_maintenance"
}
```

**字段说明：**

- `ID`: 主键，自增
- `Name`: 单位名称，必填，最大长度 100
- `Contact`: 联系人，必填，最大长度 50
- `Phone`: 联系电话，必填，最大长度 20
- `Email`: 联系邮箱，选填，最大长度 100，需验证邮箱格式
- `Address`: 地址，选填，最大长度 200
- `Type`: 维保类型，必填，枚举值：硬件维保、软件维保、综合维保、应急响应
- `CooperationDate`: 合作日期，必填，日期类型
- `Duration`: 维保时长，必填，整数类型，单位：月，范围：1-1200
- `CreatedAt`: 创建时间，自动生成
- `UpdatedAt`: 更新时间，自动更新
- `DeletedAt`: 软删除标记

**索引设计：**

- 主键索引：`ID`
- 唯一索引：`Name`（可选，根据业务需求决定是否允许重名）
- 普通索引：`Type`、`CooperationDate`、`DeletedAt`

### 2.2 枚举类型定义

```go
// 供应商类型
const (
    SupplierTypeEquipment = "设备供应商"
    SupplierTypeService   = "服务供应商"
    SupplierTypeComprehensive = "综合供应商"
)

// 维保类型
const (
    MaintenanceTypeHardware = "硬件维保"
    MaintenanceTypeSoftware = "软件维保"
    MaintenanceTypeComprehensive = "综合维保"
    MaintenanceTypeEmergency = "应急响应"
)

// 供应商类型列表
var SupplierTypes = []string{
    SupplierTypeEquipment,
    SupplierTypeService,
    SupplierTypeComprehensive,
}

// 维保类型列表
var MaintenanceTypes = []string{
    MaintenanceTypeHardware,
    MaintenanceTypeSoftware,
    MaintenanceTypeComprehensive,
    MaintenanceTypeEmergency,
}
```

### 2.3 数据库迁移

**迁移文件示例：**

```go
// migrations/20240101000000_create_partner_tables.go

func CreatePartnerTables(db *gorm.DB) error {
    // 创建供应商表
    if err := db.Exec(`
        CREATE TABLE IF NOT EXISTS partner_suppliers (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL COMMENT '供应商名称',
            contact VARCHAR(50) NOT NULL COMMENT '联系人',
            phone VARCHAR(20) NOT NULL COMMENT '联系电话',
            email VARCHAR(100) COMMENT '联系邮箱',
            address VARCHAR(200) COMMENT '地址',
            type VARCHAR(20) NOT NULL COMMENT '供应商类型',
            cooperation_date DATE NOT NULL COMMENT '合作日期',
            remark TEXT COMMENT '备注',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at DATETIME NULL,
            INDEX idx_type (type),
            INDEX idx_cooperation_date (cooperation_date),
            INDEX idx_deleted_at (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='采购供应商表';
    `).Error; err != nil {
        return err
    }

    // 创建维保单位表
    if err := db.Exec(`
        CREATE TABLE IF NOT EXISTS partner_maintenance (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL COMMENT '单位名称',
            contact VARCHAR(50) NOT NULL COMMENT '联系人',
            phone VARCHAR(20) NOT NULL COMMENT '联系电话',
            email VARCHAR(100) COMMENT '联系邮箱',
            address VARCHAR(200) COMMENT '地址',
            type VARCHAR(20) NOT NULL COMMENT '维保类型',
            cooperation_date DATE NOT NULL COMMENT '合作日期',
            duration INT NOT NULL COMMENT '维保时长(月)',
            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            deleted_at DATETIME NULL,
            INDEX idx_type (type),
            INDEX idx_cooperation_date (cooperation_date),
            INDEX idx_deleted_at (deleted_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='维保单位表';
    `).Error; err != nil {
        return err
    }

    return nil
}
```

---

## 三、API 接口设计

### 3.1 采购供应商接口

#### 3.1.1 获取供应商列表

**接口：** `GET /cmdb/partner/suppliers`

**请求参数：**

```go
type GetSuppliersRequest struct {
    Page      int    `form:"page" binding:"omitempty,min=1"`      // 页码，默认 1
    PageSize  int    `form:"pageSize" binding:"omitempty,min=1,max=100"` // 每页数量，默认 20，最大 100
    Keyword   string `form:"keyword"`                             // 搜索关键词（名称、联系人、电话、邮箱）
    Type      string `form:"type"`                                // 供应商类型筛选
    StartDate string `form:"startDate"`                           // 合作日期开始（YYYY-MM-DD）
    EndDate   string `form:"endDate"`                             // 合作日期结束（YYYY-MM-DD）
}
```

**响应数据：**

```go
type GetSuppliersResponse struct {
    Code    int        `json:"code"`
    Message string     `json:"message"`
    Data    struct {
        List     []Supplier `json:"list"`
        Total    int64      `json:"total"`
        Page     int        `json:"page"`
        PageSize int        `json:"pageSize"`
    } `json:"data"`
}
```

**业务逻辑：**

1. 参数验证和默认值设置
2. 构建查询条件（关键词搜索、类型筛选、日期范围筛选）
3. 执行分页查询
4. 返回结果

#### 3.1.2 获取供应商详情

**接口：** `GET /cmdb/partner/suppliers/:id`

**路径参数：**

- `id`: 供应商 ID（必填）

**响应数据：**

```go
type GetSupplierResponse struct {
    Code    int      `json:"code"`
    Message string   `json:"message"`
    Data    Supplier `json:"data"`
}
```

**业务逻辑：**

1. 验证 ID 参数
2. 查询数据库
3. 检查记录是否存在
4. 返回结果

#### 3.1.3 创建供应商

**接口：** `POST /cmdb/partner/suppliers`

**请求体：**

```go
type CreateSupplierRequest struct {
    Name            string    `json:"name" binding:"required,max=100"`           // 供应商名称
    Contact         string    `json:"contact" binding:"required,max=50"`        // 联系人
    Phone           string    `json:"phone" binding:"required,max=20"`        // 联系电话
    Email           string    `json:"email" binding:"omitempty,email,max=100"`  // 联系邮箱
    Address         string    `json:"address" binding:"omitempty,max=200"`     // 地址
    Type            string    `json:"type" binding:"required,oneof=设备供应商 服务供应商 综合供应商"` // 供应商类型
    CooperationDate string    `json:"cooperationDate" binding:"required"`        // 合作日期（YYYY-MM-DD）
    Remark          string    `json:"remark" binding:"omitempty,max=500"`       // 备注
}
```

**响应数据：**

```go
type CreateSupplierResponse struct {
    Code    int      `json:"code"`
    Message string   `json:"message"`
    Data    Supplier `json:"data"`
}
```

**业务逻辑：**

1. 参数验证（格式、必填项、枚举值等）
2. 日期格式转换
3. 检查重名（可选）
4. 创建记录
5. 返回创建结果

#### 3.1.4 更新供应商

**接口：** `PUT /cmdb/partner/suppliers/:id`

**路径参数：**

- `id`: 供应商 ID（必填）

**请求体：**

```go
type UpdateSupplierRequest struct {
    Name            string `json:"name" binding:"omitempty,max=100"`
    Contact         string `json:"contact" binding:"omitempty,max=50"`
    Phone           string `json:"phone" binding:"omitempty,max=20"`
    Email           string `json:"email" binding:"omitempty,email,max=100"`
    Address         string `json:"address" binding:"omitempty,max=200"`
    Type            string `json:"type" binding:"omitempty,oneof=设备供应商 服务供应商 综合供应商"`
    CooperationDate string `json:"cooperationDate" binding:"omitempty"`
    Remark          string `json:"remark" binding:"omitempty,max=500"`
}
```

**响应数据：**

```go
type UpdateSupplierResponse struct {
    Code    int      `json:"code"`
    Message string   `json:"message"`
    Data    Supplier `json:"data"`
}
```

**业务逻辑：**

1. 验证 ID 参数
2. 检查记录是否存在
3. 参数验证
4. 更新记录
5. 返回更新结果

#### 3.1.5 删除供应商

**接口：** `DELETE /cmdb/partner/suppliers/:id`

**路径参数：**

- `id`: 供应商 ID（必填）

**响应数据：**

```go
type DeleteSupplierResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}
```

**业务逻辑：**

1. 验证 ID 参数
2. 检查记录是否存在
3. 软删除记录
4. 返回结果

#### 3.1.6 批量删除供应商

**接口：** `DELETE /cmdb/partner/suppliers/batch`

**请求体：**

```go
type BatchDeleteSuppliersRequest struct {
    IDs []int64 `json:"ids" binding:"required,min=1,dive,min=1"` // 供应商 ID 列表
}
```

**响应数据：**

```go
type BatchDeleteSuppliersResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Data    struct {
        SuccessCount int `json:"successCount"` // 成功删除数量
        FailCount    int `json:"failCount"`    // 失败数量
    } `json:"data"`
}
```

**业务逻辑：**

1. 验证 ID 列表
2. 批量软删除
3. 统计成功/失败数量
4. 返回结果

### 3.2 维保单位接口

#### 3.2.1 获取维保单位列表

**接口：** `GET /cmdb/partner/maintenance`

**请求参数：**

```go
type GetMaintenanceRequest struct {
    Page      int    `form:"page" binding:"omitempty,min=1"`
    PageSize  int    `form:"pageSize" binding:"omitempty,min=1,max=100"`
    Keyword   string `form:"keyword"`
    Type      string `form:"type"`
    StartDate string `form:"startDate"`
    EndDate   string `form:"endDate"`
}
```

**响应数据：**

```go
type GetMaintenanceResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Data    struct {
        List     []Maintenance `json:"list"`
        Total    int64         `json:"total"`
        Page     int           `json:"page"`
        PageSize int           `json:"pageSize"`
    } `json:"data"`
}
```

#### 3.2.2 获取维保单位详情

**接口：** `GET /cmdb/partner/maintenance/:id`

**路径参数：**

- `id`: 维保单位 ID（必填）

**响应数据：**

```go
type GetMaintenanceDetailResponse struct {
    Code    int        `json:"code"`
    Message string     `json:"message"`
    Data    Maintenance `json:"data"`
}
```

#### 3.2.3 创建维保单位

**接口：** `POST /cmdb/partner/maintenance`

**请求体：**

```go
type CreateMaintenanceRequest struct {
    Name            string `json:"name" binding:"required,max=100"`
    Contact         string `json:"contact" binding:"required,max=50"`
    Phone           string `json:"phone" binding:"required,max=20"`
    Email           string `json:"email" binding:"omitempty,email,max=100"`
    Address         string `json:"address" binding:"omitempty,max=200"`
    Type            string `json:"type" binding:"required,oneof=硬件维保 软件维保 综合维保 应急响应"`
    CooperationDate string `json:"cooperationDate" binding:"required"`
    Duration        int    `json:"duration" binding:"required,min=1,max=1200"` // 维保时长（月）
}
```

**响应数据：**

```go
type CreateMaintenanceResponse struct {
    Code    int        `json:"code"`
    Message string     `json:"message"`
    Data    Maintenance `json:"data"`
}
```

#### 3.2.4 更新维保单位

**接口：** `PUT /cmdb/partner/maintenance/:id`

**路径参数：**

- `id`: 维保单位 ID（必填）

**请求体：**

```go
type UpdateMaintenanceRequest struct {
    Name            string `json:"name" binding:"omitempty,max=100"`
    Contact         string `json:"contact" binding:"omitempty,max=50"`
    Phone           string `json:"phone" binding:"omitempty,max=20"`
    Email           string `json:"email" binding:"omitempty,email,max=100"`
    Address         string `json:"address" binding:"omitempty,max=200"`
    Type            string `json:"type" binding:"omitempty,oneof=硬件维保 软件维保 综合维保 应急响应"`
    CooperationDate string `json:"cooperationDate" binding:"omitempty"`
    Duration        int    `json:"duration" binding:"omitempty,min=1,max=1200"`
}
```

**响应数据：**

```go
type UpdateMaintenanceResponse struct {
    Code    int        `json:"code"`
    Message string     `json:"message"`
    Data    Maintenance `json:"data"`
}
```

#### 3.2.5 删除维保单位

**接口：** `DELETE /cmdb/partner/maintenance/:id`

**路径参数：**

- `id`: 维保单位 ID（必填）

**响应数据：**

```go
type DeleteMaintenanceResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
}
```

#### 3.2.6 批量删除维保单位

**接口：** `DELETE /cmdb/partner/maintenance/batch`

**请求体：**

```go
type BatchDeleteMaintenanceRequest struct {
    IDs []int64 `json:"ids" binding:"required,min=1,dive,min=1"`
}
```

**响应数据：**

```go
type BatchDeleteMaintenanceResponse struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Data    struct {
        SuccessCount int `json:"successCount"`
        FailCount    int `json:"failCount"`
    } `json:"data"`
}
```

---

## 四、服务层设计

### 4.1 SupplierService（供应商服务）

**位置：** `internal/service/supplier.go`

```go
type SupplierService interface {
    // 获取供应商列表
    GetSuppliers(ctx context.Context, req *GetSuppliersRequest) (*GetSuppliersResponse, error)

    // 获取供应商详情
    GetSupplierByID(ctx context.Context, id int64) (*Supplier, error)

    // 创建供应商
    CreateSupplier(ctx context.Context, req *CreateSupplierRequest) (*Supplier, error)

    // 更新供应商
    UpdateSupplier(ctx context.Context, id int64, req *UpdateSupplierRequest) (*Supplier, error)

    // 删除供应商
    DeleteSupplier(ctx context.Context, id int64) error

    // 批量删除供应商
    BatchDeleteSuppliers(ctx context.Context, ids []int64) (*BatchDeleteResult, error)
}

type supplierService struct {
    db *gorm.DB
}

func NewSupplierService(db *gorm.DB) SupplierService {
    return &supplierService{db: db}
}
```

**实现要点：**

1. **GetSuppliers 实现：**

   - 构建动态查询条件
   - 关键词搜索（名称、联系人、电话、邮箱）
   - 类型筛选
   - 日期范围筛选
   - 分页查询
   - 返回总数和列表

2. **CreateSupplier 实现：**

   - 参数验证
   - 日期格式转换
   - 检查重名（可选）
   - 创建记录
   - 返回结果

3. **UpdateSupplier 实现：**

   - 检查记录是否存在
   - 参数验证
   - 更新记录
   - 返回结果

4. **DeleteSupplier 实现：**
   - 检查记录是否存在
   - 软删除
   - 返回结果

### 4.2 MaintenanceService（维保单位服务）

**位置：** `internal/service/maintenance.go`

```go
type MaintenanceService interface {
    // 获取维保单位列表
    GetMaintenanceList(ctx context.Context, req *GetMaintenanceRequest) (*GetMaintenanceResponse, error)

    // 获取维保单位详情
    GetMaintenanceByID(ctx context.Context, id int64) (*Maintenance, error)

    // 创建维保单位
    CreateMaintenance(ctx context.Context, req *CreateMaintenanceRequest) (*Maintenance, error)

    // 更新维保单位
    UpdateMaintenance(ctx context.Context, id int64, req *UpdateMaintenanceRequest) (*Maintenance, error)

    // 删除维保单位
    DeleteMaintenance(ctx context.Context, id int64) error

    // 批量删除维保单位
    BatchDeleteMaintenance(ctx context.Context, ids []int64) (*BatchDeleteResult, error)
}

type maintenanceService struct {
    db *gorm.DB
}

func NewMaintenanceService(db *gorm.DB) MaintenanceService {
    return &maintenanceService{db: db}
}
```

**实现要点：**

- 与 SupplierService 类似，但针对维保单位的特定字段（如 Duration）进行特殊处理

---

## 五、控制器层设计

### 5.1 SupplierController（供应商控制器）

**位置：** `internal/controller/supplier.go`

```go
type SupplierController struct {
    service SupplierService
}

func NewSupplierController(service SupplierService) *SupplierController {
    return &SupplierController{service: service}
}

// GetSuppliers 获取供应商列表
func (c *SupplierController) GetSuppliers(ctx *gin.Context) {
    var req GetSuppliersRequest
    if err := ctx.ShouldBindQuery(&req); err != nil {
        response.Error(ctx, err)
        return
    }

    // 设置默认值
    if req.Page <= 0 {
        req.Page = 1
    }
    if req.PageSize <= 0 {
        req.PageSize = 20
    }

    result, err := c.service.GetSuppliers(ctx.Request.Context(), &req)
    if err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, result)
}

// GetSupplier 获取供应商详情
func (c *SupplierController) GetSupplier(ctx *gin.Context) {
    id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
    if err != nil {
        response.Error(ctx, errors.New("invalid id"))
        return
    }

    supplier, err := c.service.GetSupplierByID(ctx.Request.Context(), id)
    if err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, supplier)
}

// CreateSupplier 创建供应商
func (c *SupplierController) CreateSupplier(ctx *gin.Context) {
    var req CreateSupplierRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        response.Error(ctx, err)
        return
    }

    supplier, err := c.service.CreateSupplier(ctx.Request.Context(), &req)
    if err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, supplier)
}

// UpdateSupplier 更新供应商
func (c *SupplierController) UpdateSupplier(ctx *gin.Context) {
    id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
    if err != nil {
        response.Error(ctx, errors.New("invalid id"))
        return
    }

    var req UpdateSupplierRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        response.Error(ctx, err)
        return
    }

    supplier, err := c.service.UpdateSupplier(ctx.Request.Context(), id, &req)
    if err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, supplier)
}

// DeleteSupplier 删除供应商
func (c *SupplierController) DeleteSupplier(ctx *gin.Context) {
    id, err := strconv.ParseInt(ctx.Param("id"), 10, 64)
    if err != nil {
        response.Error(ctx, errors.New("invalid id"))
        return
    }

    if err := c.service.DeleteSupplier(ctx.Request.Context(), id); err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, nil)
}

// BatchDeleteSuppliers 批量删除供应商
func (c *SupplierController) BatchDeleteSuppliers(ctx *gin.Context) {
    var req BatchDeleteSuppliersRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        response.Error(ctx, err)
        return
    }

    result, err := c.service.BatchDeleteSuppliers(ctx.Request.Context(), req.IDs)
    if err != nil {
        response.Error(ctx, err)
        return
    }

    response.Success(ctx, result)
}
```

### 5.2 MaintenanceController（维保单位控制器）

**位置：** `internal/controller/maintenance.go`

实现方式与 SupplierController 类似，但针对维保单位的接口。

---

## 六、路由配置

### 6.1 路由定义

```go
// internal/router/partner.go

func RegisterPartnerRoutes(router *gin.RouterGroup, supplierCtrl *controller.SupplierController, maintenanceCtrl *controller.MaintenanceController) {
    partner := router.Group("/partner")
    {
        // 供应商路由
        suppliers := partner.Group("/suppliers")
        {
            suppliers.GET("", supplierCtrl.GetSuppliers)
            suppliers.GET("/:id", supplierCtrl.GetSupplier)
            suppliers.POST("", supplierCtrl.CreateSupplier)
            suppliers.PUT("/:id", supplierCtrl.UpdateSupplier)
            suppliers.DELETE("/:id", supplierCtrl.DeleteSupplier)
            suppliers.DELETE("/batch", supplierCtrl.BatchDeleteSuppliers)
        }

        // 维保单位路由
        maintenance := partner.Group("/maintenance")
        {
            maintenance.GET("", maintenanceCtrl.GetMaintenanceList)
            maintenance.GET("/:id", maintenanceCtrl.GetMaintenanceDetail)
            maintenance.POST("", maintenanceCtrl.CreateMaintenance)
            maintenance.PUT("/:id", maintenanceCtrl.UpdateMaintenance)
            maintenance.DELETE("/:id", maintenanceCtrl.DeleteMaintenance)
            maintenance.DELETE("/batch", maintenanceCtrl.BatchDeleteMaintenance)
        }
    }
}
```

### 6.2 中间件

- 身份验证中间件
- 权限验证中间件
- 请求日志中间件
- 错误处理中间件

---

## 七、数据验证

### 7.1 验证规则

1. **必填字段验证：**

   - 供应商名称、联系人、联系电话、供应商类型、合作日期
   - 维保单位名称、联系人、联系电话、维保类型、合作日期、维保时长

2. **格式验证：**

   - 邮箱格式验证（使用 `email` 标签）
   - 电话格式验证（自定义验证器）
   - 日期格式验证（YYYY-MM-DD）

3. **长度验证：**

   - 名称：最大 100 字符
   - 联系人：最大 50 字符
   - 电话：最大 20 字符
   - 邮箱：最大 100 字符
   - 地址：最大 200 字符
   - 备注：最大 500 字符

4. **枚举值验证：**

   - 供应商类型：设备供应商、服务供应商、综合供应商
   - 维保类型：硬件维保、软件维保、综合维保、应急响应

5. **数值范围验证：**
   - 维保时长：1-1200 个月

### 7.2 自定义验证器

```go
// 电话格式验证器
func ValidatePhone(fl validator.FieldLevel) bool {
    phone := fl.Field().String()
    // 支持手机号和座机号格式
    matched, _ := regexp.MatchString(`^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$`, phone)
    return matched
}

// 注册自定义验证器
func init() {
    if v, ok := binding.Validator.Engine().(*validator.Validate); ok {
        v.RegisterValidation("phone", ValidatePhone)
    }
}
```

---

## 八、错误处理

### 8.1 错误码定义

```go
const (
    ErrCodeSupplierNotFound     = 10001 // 供应商不存在
    ErrCodeMaintenanceNotFound  = 10002 // 维保单位不存在
    ErrCodeSupplierNameExists   = 10003 // 供应商名称已存在
    ErrCodeMaintenanceNameExists = 10004 // 维保单位名称已存在
    ErrCodeInvalidDate          = 10005 // 日期格式错误
    ErrCodeInvalidType          = 10006 // 类型枚举值错误
    ErrCodeInvalidDuration      = 10007 // 维保时长范围错误
)
```

### 8.2 统一响应格式

```go
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

func Success(ctx *gin.Context, data interface{}) {
    ctx.JSON(http.StatusOK, Response{
        Code:    0,
        Message: "success",
        Data:    data,
    })
}

func Error(ctx *gin.Context, err error) {
    // 根据错误类型返回相应的错误码和消息
    ctx.JSON(http.StatusOK, Response{
        Code:    GetErrorCode(err),
        Message: err.Error(),
    })
}
```

---

## 九、数据库查询优化

### 9.1 索引优化

- 在 `type` 字段上建立索引，加速类型筛选
- 在 `cooperation_date` 字段上建立索引，加速日期范围查询
- 在 `deleted_at` 字段上建立索引，加速软删除查询

### 9.2 查询优化

1. **关键词搜索优化：**

   - 使用 `LIKE` 查询，但避免前导通配符（如 `%keyword`）
   - 对于大数据量，考虑使用全文索引

2. **分页优化：**

   - 使用 `LIMIT` 和 `OFFSET` 进行分页
   - 对于大数据量，考虑使用游标分页

3. **关联查询：**
   - 当前阶段无关联查询，后续如有需要再优化

---

## 十、日志和监控

### 10.1 日志记录

- 记录所有 API 请求和响应
- 记录错误信息
- 记录关键业务操作（创建、更新、删除）

### 10.2 监控指标

- API 响应时间
- 错误率
- 数据库查询性能
- 请求量统计

---

## 十一、测试计划

### 11.1 单元测试

- 服务层逻辑测试
- 数据验证测试
- 错误处理测试

### 11.2 集成测试

- API 接口测试
- 数据库操作测试
- 端到端测试

### 11.3 测试用例

1. **供应商管理测试：**

   - 创建供应商（正常/异常）
   - 更新供应商（正常/异常）
   - 删除供应商
   - 查询供应商列表（各种筛选条件）
   - 批量删除

2. **维保单位管理测试：**
   - 创建维保单位（正常/异常）
   - 更新维保单位（正常/异常）
   - 删除维保单位
   - 查询维保单位列表（各种筛选条件）
   - 批量删除

---

## 十二、开发计划

### 12.1 开发阶段

**第一阶段：数据模型和基础框架（3-4 天）**

- 数据库表设计
- 数据模型定义
- 数据库迁移脚本
- 基础项目结构搭建

**第二阶段：供应商管理功能（4-5 天）**

- 服务层实现
- 控制器实现
- 路由配置
- 单元测试

**第三阶段：维保单位管理功能（4-5 天）**

- 服务层实现
- 控制器实现
- 路由配置
- 单元测试

**第四阶段：测试和优化（2-3 天）**

- 集成测试
- 性能优化
- 文档完善
- Bug 修复

### 12.2 开发顺序

1. 数据库设计和迁移
2. 数据模型定义
3. 供应商管理功能开发
4. 维保单位管理功能开发
5. 测试和优化

---

### 13.4 代码规范

- 遵循 Go 代码规范
- 使用统一的错误处理
- 使用统一的响应格式
- 完善的代码注释
- 单元测试覆盖
