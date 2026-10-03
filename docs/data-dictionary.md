# 合成数据字典

**全部企业名称、记录、资质、政府指标与结果均为虚构。** 原始金额单位为人民币百万元，比例为小数。面板年度为 2022–2025，研究标签是模拟下一年度事件，并非观测违约。网页金额显示为万元或亿元，图表与测算输入另标百万元。

[中文面板 CSV](../public/data/enterprise-panel.zh-CN.csv)使用中文表头、城市、行业和是／否标记，保留原始数值。代码复现使用稳定的英文机器字段，下表说明其中文含义。

| 原始字段 | 类型 / 单位 | 中文含义 |
|---|---|---|
| enterprise_id | 字符串 | 唯一合成编号，P=演示客户，R=研究企业 |
| company_name / name_en | 字符串 | 虚构中文及英文名称；演示中文名含“虚构” |
| industry / city | 分类 | 八个演示行业、广东四座城市 |
| year | 整数 | 财务快照年度 |
| synthetic | 布尔 | 合成标记，恒为真 |
| revenue | 百万元 | 会计营业收入 |
| revenue_growth | 小数 | 相对上一生成年度的增长；首年为固定种子的基线假设 |
| profit | 百万元 | 额外研发扣除前的会计利润 |
| total_assets / liabilities | 百万元 | 合成资产负债表，负债低于资产 |
| employees | 人 | 快照员工数，不是法定季度平均人数 |
| rd_expense / rd_intensity | 百万元 / 小数 | 会计研发支出及研发 / 收入 |
| eligible_rd_expense | 百万元 | 示例税基调整中假定合格的研发部分 |
| rd_staff_ratio | 小数 | 模拟研发人员占比，不等于法定科技人员口径 |
| rd_growth | 小数 | 相对上一生成年度的研发增长 |
| patents / patent_growth | 项 | 模拟专利存量及年度新增，不判断质量 |
| high_tech_status | 布尔 | 模拟高企标记，不是核验后的证书 |
| specialized_sme | 布尔 | 模拟专精特新企业标记 |
| government_innovation_indicator | 布尔 | 模拟政府创新指标 |
| vat_general_taxpayer | 布尔 | 假定一般纳税人状态 |
| approved_manufacturing_list | 布尔 | 独立的模拟批准名单证据标记 |
| vat_sales / vat_paid | 百万元 | 应税销售额代理及简化增值税现金缴款 |
| cit_paid / taxable_income | 百万元 | 简化所得税现金缴款与税基调整 |
| tax_credit_grade | 分类 | 模拟 A/B/M/C/D 纳税信用等级 |
| invoice_purchase / invoice_sales | 百万元 | 模拟购进与销项开票金额 |
| cash_flow | 百万元 | 示例经营现金流 |
| loan_balance | 百万元 | 低于负债的贷款余额 |
| export_sales | 百万元 | 模拟出口销售额 |
| synthetic_default_next_year | 0/1 | 伯努利抽取的研究演示标签 |
| history | 数组 | 四个会计年度记录 |
| risks | 数组 | 计算的信号、规则、依据、合理成因与核验步骤 |
| innovation | 对象 | 六项评分与公开公式 |
| opportunities | 数组 | 有日期的政策或融资线索及缺失材料 |
| brief | 对象 | 确定性证据摘要与智能体轨迹 |
| credit | 对象 | 合成标签模型预测，不是真实违约概率 |

## 数据一致性与预设差异

生成器通过收入及行业强度计算研发，连接资产、负债与贷款，区分会计利润和简化税基，并关联增值税销售额、发票与进销项假设。部分企业末年增值税销售额被降低以形成勾稽案例，差异不标记为违法。案例二另有年度研发与资质标记不一致。

简化税基采用假定的合格研发比例、税率及小企业快照筛选，未覆盖完整法定税基、亏损结转、人数与资产季度平均值、全部增值税分类、出口退税或现金与权责时点，不能用于真实报税。2026 年政策线索与 2025 年税款生成独立。

## 派生特征与政策结构

资产负债率=`liabilities/total_assets`；利润率=`profit/revenue`；现金流比=`cash_flow/revenue`；贷款资产比=`loan_balance/total_assets`；绝对增值税差异=`abs(vat_sales−revenue)/revenue`；现金税负=`(vat_paid+cit_paid)/revenue`。现金税负是现金流代理，不是法定有效所得税率。对数使用 `log(1+x)`。

政策结构包含编号、标题、部门、文号、发布／生效／终止日期、地区、税种、主体、条件、待遇、原文、摘要、双语关键词、来源类型与核验日。空生效日期表示方向性报道未规定，不补造日期。深圳通知终止日为最后公布批次截止日，不表示基础认定制度废止。
