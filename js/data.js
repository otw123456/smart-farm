/* ============================================================
   智慧农场综合管控平台 · 数据层 data.js
   大棚 / 农田 测点数据汇总，大屏与系统共用同一份数据源
   （开发阶段升级为 API 后，仅需替换 loadFarmData() 内部实现）
   ============================================================ */
(function (global) {

  /* ---------- 大棚测点数据（1~5 号大棚） ---------- */
  var DATA = {
    1: { env:{t:"25.8",h:"58",c:"480",l:"25000",p:"15"}, soil:{t:"21.5",h:"58",e:"1.1",p:"6.8",s:"0.22"}, grow:{sc:"85",y:"480",tr:"2.5",la:"3.0",m:"30",up:"8",ir:"26"} },
    2: { env:{t:"26.2",h:"60",c:"470",l:"27000",p:"16"}, soil:{t:"21.8",h:"62",e:"1.2",p:"6.7",s:"0.23"}, grow:{sc:"88",y:"500",tr:"2.6",la:"3.1",m:"32",up:"10",ir:"27"} },
    3: { env:{t:"26.8",h:"62",c:"460",l:"28000",p:"18"}, soil:{t:"22.1",h:"66",e:"1.3",p:"6.6",s:"0.25"}, grow:{sc:"90",y:"520",tr:"2.8",la:"3.2",m:"35",up:"12",ir:"28"} },
    4: { env:{t:"25.5",h:"57",c:"490",l:"23000",p:"14"}, soil:{t:"21.2",h:"55",e:"1.0",p:"6.9",s:"0.21"}, grow:{sc:"82",y:"460",tr:"2.4",la:"2.9",m:"28",up:"7",ir:"25"} },
    5: { env:{t:"26.0",h:"61",c:"465",l:"26500",p:"17"}, soil:{t:"21.9",h:"63",e:"1.25",p:"6.7",s:"0.24"}, grow:{sc:"87",y:"495",tr:"2.7",la:"3.1",m:"33",up:"11",ir:"27"} }
  };

  /* ---------- 水稻田块测点数据（1~5 号田） ---------- */
  var FDATA = {
    1: { env:{wt:"28.4",mt:"24.6",wl:"6.5",do:"5.2",sp:"38"}, soil:{ph:"6.5",om:"2.4",n:"130",p:"28",k:"160"}, grow:{sc:"86",ti:"24",ph:"78",la:"3.6",m:"55",up:"9",ir:"62"} },
    2: { env:{wt:"27.9",mt:"24.2",wl:"5.8",do:"5.6",sp:"36"}, soil:{ph:"6.7",om:"2.2",n:"120",p:"25",k:"150"}, grow:{sc:"84",ti:"22",ph:"74",la:"3.4",m:"50",up:"7",ir:"58"} },
    3: { env:{wt:"29.6",mt:"25.1",wl:"8.2",do:"4.4",sp:"32"}, soil:{ph:"6.2",om:"1.9",n:"105",p:"22",k:"140"}, grow:{sc:"78",ti:"19",ph:"70",la:"3.0",m:"45",up:"5",ir:"75"} },
    4: { env:{wt:"28.1",mt:"24.4",wl:"5.5",do:"5.8",sp:"40"}, soil:{ph:"6.8",om:"2.6",n:"140",p:"30",k:"170"}, grow:{sc:"88",ti:"26",ph:"80",la:"3.8",m:"60",up:"11",ir:"55"} },
    5: { env:{wt:"28.8",mt:"24.8",wl:"6.0",do:"5.4",sp:"37"}, soil:{ph:"6.6",om:"2.3",n:"125",p:"27",k:"155"}, grow:{sc:"85",ti:"23",ph:"76",la:"3.5",m:"52",up:"8",ir:"60"} }
  };

  /* ---------- 大屏视图标签 ---------- */
  var LBL = {
    gh: {
      envHead:'环境监测', envK:['空气温度','空气湿度','CO₂浓度','光照强度','PM2.5'], envU:['℃','%RH','ppm','Lux','μg/m³'],
      thTitle:'温湿度分析', thL1:'温度', thL2:'湿度',
      soilTitle:'土壤理化指标', soilK:['土壤温度','土壤湿度','土壤EC','土壤pH','土壤盐分'], soilU:['℃','%','mS/cm','—','%'],
      growTitle:'每日数据', growRing:'作物生长指数',
      growK:['今日产量','蒸腾量','叶面积指数','成熟度','预估增产','灌溉量'], growU:['kg','mm','LAI','%','%','L/亩'],
      devTitle:'设备状态', devSub:'自动滚动', unitLabel:'号大棚'
    },
    farm: {
      envHead:'田块监测', envK:['水温','泥温','水位','溶解氧','叶绿素'], envU:['℃','℃','cm','mg/L','SPAD'],
      thTitle:'水温水位分析', thL1:'水温', thL2:'水位',
      soilTitle:'土壤肥力指标', soilK:['土壤pH','有机质','全氮','速效磷','速效钾'], soilU:['—','%','mg/kg','mg/kg','mg/kg'],
      growTitle:'水稻生长数据', growRing:'长势指数',
      growK:['分蘖数','株高','叶面积指数','成熟度','预估增产','灌溉量'], growU:['万株/亩','cm','LAI','%','%','m³/亩'],
      devTitle:'田块设备', devSub:'自动滚动', unitLabel:'号田'
    }
  };

  /* ---------- 设备台账（大棚 / 农田共用汇总） ---------- */
  var DEVICES = {
    gh: [
      {name:'1号风机',     loc:'1号大棚', st:'on',  param:'转速', val:'1450 r/min', stTxt:'运行中'},
      {name:'2号水帘',     loc:'1号大棚', st:'off', param:'水压', val:'0 MPa',      stTxt:'已停止'},
      {name:'3号卷帘',     loc:'1号大棚', st:'on',  param:'开度', val:'80%',        stTxt:'开启'},
      {name:'4号灌溉阀门', loc:'1号大棚', st:'off', param:'流量', val:'0 m³/h',     stTxt:'关闭'},
      {name:'5号补光灯',   loc:'3号大棚', st:'on',  param:'光照', val:'5.0h',       stTxt:'开启'},
      {name:'6号杀虫灯',   loc:'2号大棚', st:'off', param:'诱虫', val:'32只',       stTxt:'已停止'},
      {name:'7号环流风机', loc:'2号大棚', st:'on',  param:'电流', val:'1.8 A',      stTxt:'运行中'},
      {name:'8号施肥机',   loc:'3号大棚', st:'err', param:'料位', val:'异常',       stTxt:'故障'}
    ],
    farm: [
      {name:'1号灌排闸门',   loc:'1号田', st:'on',  param:'开度', val:'65%',    stTxt:'开启'},
      {name:'2号水泵',       loc:'2号田', st:'on',  param:'流量', val:'12 m³/h',stTxt:'运行中'},
      {name:'3号增氧机',     loc:'3号田', st:'off', param:'流量', val:'0 m³/h', stTxt:'已停止'},
      {name:'4号虫情测报灯', loc:'4号田', st:'on',  param:'诱虫', val:'21只',   stTxt:'运行中'},
      {name:'5号水质传感器', loc:'5号田', st:'on',  param:'状态', val:'在线',   stTxt:'正常'},
      {name:'6号植保无人机', loc:'1号田', st:'off', param:'状态', val:'待机',   stTxt:'待机'},
      {name:'7号田间摄像头', loc:'2号田', st:'on',  param:'状态', val:'在线',   stTxt:'正常'},
      {name:'8号智能施肥机', loc:'3号田', st:'err', param:'料位', val:'异常',   stTxt:'故障'}
    ]
  };

  /* ---------- 告警汇总 ---------- */
  var ALARMS = [
    {lv:'紧急', type:'环境越限', content:'3号大棚空气温度超上限 34.2℃', loc:'3号大棚', time:'18:15', st:'待处置'},
    {lv:'紧急', type:'设备故障', content:'8号施肥机料位异常', loc:'3号大棚', time:'17:42', st:'待处置'},
    {lv:'预警', type:'气象预警', content:'未来24小时累计雨量将超80mm', loc:'园区', time:'18:22', st:'待处置'},
    {lv:'预警', type:'环境越限', content:'3号大棚湿度低于阈值，建议补水', loc:'3号大棚', time:'18:15', st:'待处置'},
    {lv:'预警', type:'气象预警', content:'1号大棚夜间气温将降至2℃以下', loc:'1号大棚', time:'18:10', st:'已派单'},
    {lv:'预警', type:'环境越限', content:'5号大棚光照时长不足，建议补光', loc:'5号大棚', time:'18:05', st:'已处置'}
  ];

  /* ---------- 农事台账 ---------- */
  var FARMS = [
    {time:'09:20', loc:'2号大棚', type:'打药', person:'李农', use:'10L', note:'白粉病防治，稀释800倍'},
    {time:'14:20', loc:'1号大棚', type:'施肥', person:'李农', use:'8kg', note:'高钾肥追施'},
    {time:'16:30', loc:'3号大棚', type:'灌溉', person:'系统自动', use:'28L/亩', note:'土壤湿度触发自动灌溉'}
  ];

  /* ---------- 每日报表汇总 ---------- */
  var REPORT = {
    date:'2026-09-11',
    env: [
      {name:'空气温度', avg:'26.8℃', max:'31.2℃', maxT:'14:32', min:'18.5℃', minT:'05:12', over:'0.5h'},
      {name:'空气湿度', avg:'62%RH', max:'84%',    maxT:'06:40', min:'48%',   minT:'13:05', over:'2.1h'},
      {name:'CO₂浓度', avg:'460ppm',max:'620ppm', maxT:'02:15', min:'380ppm',minT:'14:50', over:'0h'},
      {name:'光照强度', avg:'28000Lux',max:'48600Lux',maxT:'12:20',min:'0Lux',minT:'23:00', over:'1.2h'},
      {name:'PM2.5',   avg:'18μg/m³',max:'36μg/m³',maxT:'08:10',min:'9μg/m³',minT:'16:45', over:'0h'},
      {name:'土壤温度', avg:'22.1℃', max:'24.6℃', maxT:'15:10', min:'19.8℃',minT:'04:30', over:'0h'},
      {name:'土壤湿度', avg:'66%',   max:'72%',    maxT:'09:00', min:'54%',   minT:'17:40', over:'3.4h'}
    ],
    devRun: [
      {name:'1号风机', run:'09:00-18:30', hours:'9.5h', power:'6.8kWh'},
      {name:'2号水帘', run:'—', hours:'0h', power:'0kWh'},
      {name:'3号卷帘', run:'08:10-17:40', hours:'9.5h', power:'1.2kWh'},
      {name:'4号灌溉阀', run:'16:20-16:40', hours:'0.3h', power:'—'},
      {name:'8号施肥机', run:'故障停机', hours:'—', power:'—'}
    ],
    farmOp: [
      {time:'09:20', type:'打药', use:'10L', person:'李农'},
      {time:'14:20', type:'施肥', use:'8kg', person:'李农'},
      {time:'16:30', type:'灌溉', use:'28L/亩', person:'系统自动'}
    ],
    summary: [
      {cat:'告警处置', content:'3号大棚湿度低 · 8号施肥机故障 · 雨量预警等', num:'6条', st:'4 待处理'},
      {cat:'气象记录', content:'室外25.3℃ / 降水0.5mm / 东南风2.1m/s / 辐射850W/m²', num:'6项', st:'正常'},
      {cat:'产量记录', content:'今日采收 2号大棚 500kg + 3号大棚 20kg', num:'520kg', st:'已归档'},
      {cat:'投入记录', content:'水 28L/亩 · 肥 8kg · 药 10L', num:'3项', st:'已归档'}
    ]
  };

  /* ---------- 作物产量（分作物，不同作物独立统计） ---------- */
  var CROPS = [
    {name:'黄瓜',  kg:320, unit:'kg', area:'1号/2号大棚', trend:'+6.2%'},
    {name:'番茄',  kg:180, unit:'kg', area:'3号大棚',     trend:'+3.1%'},
    {name:'叶菜',  kg:20,  unit:'kg', area:'4号大棚',     trend:'-1.5%'}
  ];

  /* ---------- 气象记录（园区级） ---------- */
  var WEATHER = [
    {k:'室外温度', v:'25.3', u:'℃',   st:'正常'},
    {k:'相对湿度', v:'62',   u:'%',   st:'正常'},
    {k:'降水量',   v:'0.5',  u:'mm',  st:'正常'},
    {k:'风速风向', v:'2.1',  u:'m/s 东南风', st:'正常'},
    {k:'太阳辐射', v:'850',  u:'W/m²', st:'正常'},
    {k:'日照时长', v:'7.2',  u:'h',   st:'正常'}
  ];

  /* ---------- 系统管理：用户 / 日志 / 测点 ---------- */
  var USERS = [
    {name:'张工', role:'管理员', scope:'全部', login:'2026-09-11 09:02'},
    {name:'王技', role:'技术员', scope:'设备/告警/报表', login:'2026-09-11 08:40'},
    {name:'李农', role:'操作员', scope:'设备操作/农事登记', login:'2026-09-11 07:10'}
  ];
  var LOGS = [
    {time:'09:02', user:'张工', op:'导出 9月10日 日报'},
    {time:'08:40', user:'王技', op:'调整告警阈值'},
    {time:'07:12', user:'李农', op:'登记农事（施肥）'},
    {time:'00:01', user:'系统', op:'自动生成 9月10日 报表'}
  ];
  var POINTS = [
    {name:'空气温度-1', loc:'1号大棚', freq:'1分钟', online:true,  today:'1440条'},
    {name:'土壤湿度-3', loc:'3号大棚', freq:'5分钟', online:true,  today:'288条'},
    {name:'营养液EC-1', loc:'连栋温室', freq:'1分钟', online:true,  today:'1440条'},
    {name:'光照-5',     loc:'5号大棚', freq:'1分钟', online:false, today:'—'}
  ];

  /* ---------- 汇总展示：大棚 + 农田 一页看全 ---------- */
  function summary(){
    var list = [];
    for (var i = 1; i <= 5; i++){
      var g = DATA[i];
      list.push({
        kind:'gh', id:i, name:i + '号大棚',
        envT:+g.env.t, envH:+g.env.h, co2:+g.env.c, lux:+g.env.l, pm:+g.env.p,
        soilT:+g.soil.t, soilH:+g.soil.h, ec:+g.soil.e, ph:+g.soil.p, salt:+g.soil.s,
        score:+g.grow.sc, yieldKg:+g.grow.y, ir:+g.grow.ir
      });
      var f = FDATA[i];
      list.push({
        kind:'farm', id:i, name:i + '号田',
        wt:+f.env.wt, mt:+f.env.mt, wl:+f.env.wl, do:+f.env.do, sp:+f.env.sp,
        ph:+f.soil.ph, om:+f.soil.om, n:+f.soil.n, p:+f.soil.p, k:+f.soil.k,
        score:+f.grow.sc, ti:+f.grow.ti, phcm:+f.grow.ph, ir:+f.grow.ir
      });
    }
    return list;
  }

  global.FarmData = { DATA: DATA, FDATA: FDATA, LBL: LBL, DEVICES: DEVICES, ALARMS: ALARMS,
    FARMS: FARMS, REPORT: REPORT, USERS: USERS, LOGS: LOGS, POINTS: POINTS,
    CROPS: CROPS, WEATHER: WEATHER, summary: summary };
})(window);
