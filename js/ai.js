/* ============================================================
   小农 · 前端专家规则库 ai.js
   —— 基于各测点实时数据的专业诊断与农事指导意见
   说明：当前为规则引擎版本（方案A），本地化静态部署可用；
        开发阶段升级时，仅需替换 ask() 内部为真实大模型 API 调用。
   ============================================================ */
(function (global) {

  /* ---------- 大棚作物（设施果蔬）专家知识库 ---------- */
  var GH_RULES = {
    env: [
      {key:'t', name:'空气温度', unit:'℃',  lo:20, hi:30, warnLo:12, warnHi:32,
       advLow:'气温偏低，建议白天关闭卷帘保温、开启环流风机均匀热气，夜间加盖保温被；低于8℃需开启加温设备。',
       advHigh:'气温偏高，建议立即开启风机+水帘通风降温，适当遮阳，并检查通风口是否堵塞；超过34℃易引发花芽分化不良与日灼。',
       advOk:'当前棚温处于作物最适区间（20~30℃），维持现通风策略即可。'},
      {key:'h', name:'空气湿度', unit:'%RH', lo:55, hi:85, warnLo:45, warnHi:92,
       advLow:'空气湿度过低，植株蒸腾加剧，建议开启加湿/喷雾，或结合浇水后密闭棚室短时增湿；长期低湿易诱发红蜘蛛。',
       advHigh:'湿度持续偏高，灰霉病/霜霉病风险上升，建议加强通风排湿、中午短时放风，发病前可预防性喷施保护性杀菌剂。',
       advOk:'湿度适中（55~85%），有利于光合与授粉坐果，维持现状。'},
      {key:'c', name:'CO₂浓度', unit:'ppm', lo:400, hi:900, warnLo:350, warnHi:1200,
       advLow:'CO₂浓度偏低，光合速率受抑，建议上午9-11点通风换气或启用CO₂气肥（番茄结果期可增施至800-1000ppm）。',
       advHigh:'CO₂浓度过高，多因密闭过久，建议立即通风换气，避免长时间闷棚。',
       advOk:'CO₂浓度适宜，光合效率正常。'},
      {key:'l', name:'光照强度', unit:'Lux', lo:25000, hi:45000, warnLo:20000, warnHi:52000,
       advLow:'光照不足，植株易徒长、坐果率下降，建议开启补光灯（早晚各2-3小时），并定期清洗棚膜提高透光率。',
       advHigh:'光照过强，可能引起日灼与叶片灼伤，建议中午覆盖遮阳网（遮光率30-50%）。',
       advOk:'光照充足，满足光合需求。'},
      {key:'p', name:'PM2.5', unit:'μg/m³', lo:0, hi:35, warnLo:-1, warnHi:75,
       advLow:'空气质量优，正常通风即可。',
       advHigh:'颗粒物浓度偏高，建议减少扬尘作业，必要时开启空气净化/降尘，避免污染物附着叶片影响光合。',
       advOk:'颗粒物浓度良好，无需处理。'}
    ],
    soil: [
      {key:'t', name:'土壤温度', unit:'℃', lo:18, hi:26, warnLo:14, warnHi:30,
       advLow:'地温偏低，根系活力差、养分吸收慢，建议覆盖地膜增温或提高棚温间接提温，避免大水漫灌。',
       advHigh:'地温过高，根系易受灼伤，建议小水勤浇降温并适当遮阳。',
       advOk:'地温适宜，根系吸收旺盛。'},
      {key:'h', name:'土壤湿度', unit:'%', lo:55, hi:80, warnLo:45, warnHi:90,
       advLow:'土壤缺水，建议小水勤浇或滴灌补水（保持见干见湿），避免大水冲击根系；结果期保持水分均匀防裂果。',
       advHigh:'土壤过湿，根系缺氧易沤根，建议暂停灌溉、加强通风排湿，必要时中耕松土。',
       advOk:'土壤墒情良好。'},
      {key:'e', name:'土壤EC', unit:'mS/cm', lo:1.0, hi:2.5, warnLo:0.6, warnHi:3.5,
       advLow:'EC偏低说明养分浓度不足，建议追施平衡肥（如15-15-15）或叶面补充微量元素。',
       advHigh:'EC偏高，土壤盐分积累，易烧根，建议加大滴灌量淋洗盐分，减少施肥，改用低盐配方肥。',
       advOk:'EC处于适合作物吸收的区间。'},
      {key:'p', name:'土壤pH', unit:'—', lo:6.0, hi:7.2, warnLo:5.2, warnHi:7.8,
       advLow:'土壤偏酸，建议亩施生石灰50-80kg调节，并增施有机肥改良。',
       advHigh:'土壤偏碱，易缺铁黄化，建议增施硫磺粉或酸性有机肥，叶面补施螯合铁。',
       advOk:'pH适宜，养分有效性高。'},
      {key:'s', name:'土壤盐分', unit:'%', lo:0, hi:0.3, warnLo:-1, warnHi:0.45,
       advLow:'盐分正常。',
       advHigh:'盐分偏高，抑制根系吸水，建议淋洗排盐、增施有机肥，必要时更换表层土。',
       advOk:'盐分正常，无盐害风险。'}
    ],
    grow: [
      {key:'sc', name:'作物生长指数', unit:'分', lo:85, hi:100, warnLo:70, warnHi:100,
       advLow:'长势指数偏低，需综合排查温光水肥，优先解决异常指标；可叶面喷施氨基酸类叶面肥促进恢复。',
       advHigh:'长势优良，保持现有管理方案。',
       advOk:'长势良好，按计划管理即可。'}
    ]
  };

  /* ---------- 水稻田块专家知识库 ---------- */
  var FARM_RULES = {
    env: [
      {key:'wt', name:'水温', unit:'℃', lo:24, hi:32, warnLo:20, warnHi:35,
       advLow:'水温偏低，建议浅水勤灌、晴暖天上午进水，避免冷浸水直接入田；低温会延缓分蘖发生。',
       advHigh:'水温过高，建议加深水层或串灌降温，防止烫伤稻苗、抑制根系。',
       advOk:'水温处于分蘖期适宜区间（24~32℃），利于分蘖发生。'},
      {key:'mt', name:'泥温', unit:'℃', lo:22, hi:30, warnLo:18, warnHi:34,
       advLow:'泥温偏低，根系活力差，建议浅灌晒田提温（分蘖盛期可适度晒田3-5天）。',
       advHigh:'泥温过高，建议深水层护苗降温。',
       advOk:'泥温适宜，根系发育良好。'},
      {key:'wl', name:'水位', unit:'cm', lo:5, hi:10, warnLo:3, warnHi:15,
       advLow:'水层过浅，建议及时补水至5-10cm；分蘖期浅水灌溉利于低位分蘖。',
       advHigh:'水层过深，易引起徒长、倒伏风险，建议排水至适宜深度，孕穗期保持10cm左右水层。',
       advOk:'水层深度适宜（浅水勤灌），分蘖与根系生长正常。'},
      {key:'do', name:'溶解氧', unit:'mg/L', lo:5, hi:10, warnLo:4, warnHi:10,
       advLow:'水体缺氧，根系呼吸受阻，建议开启增氧机或换水增氧；长期低氧易发生根腐。',
       advHigh:'溶解氧充足。',
       advOk:'溶解氧充足，根系活力好。'},
      {key:'sp', name:'叶绿素SPAD', unit:'SPAD', lo:35, hi:45, warnLo:30, warnHi:50,
       advLow:'叶色偏淡、氮素不足，建议追施速效氮肥（分蘖期可亩施尿素5-8kg），防止早衰。',
       advHigh:'叶色浓绿、氮素偏多，建议控氮增钾、适当晒田，防止贪青晚熟与病虫害。',
       advOk:'叶绿素含量适宜，氮素营养平衡。'}
    ],
    soil: [
      {key:'ph', name:'土壤pH', unit:'—', lo:5.5, hi:7.0, warnLo:5.0, warnHi:7.5,
       advLow:'土壤偏酸，建议亩施生石灰50-80kg并增施有机肥。',
       advHigh:'土壤偏碱，建议增施硫磺粉或生理酸性肥料（硫酸铵等）调节。',
       advOk:'pH适宜水稻生长。'},
      {key:'om', name:'有机质', unit:'%', lo:2.0, hi:5.0, warnLo:1.5, warnHi:5.0,
       advLow:'有机质偏低，建议增施腐熟有机肥或秸秆还田，改善土壤团粒结构。',
       advHigh:'有机质含量良好。',
       advOk:'有机质充足，地力良好。'},
      {key:'n', name:'全氮', unit:'mg/kg', lo:120, hi:200, warnLo:100, warnHi:220,
       advLow:'全氮偏低，建议分蘖期追施氮肥促分蘖，但孕穗后控氮防贪青。',
       advHigh:'全氮偏高，建议控氮增施磷钾，适度晒田。',
       advOk:'氮素供应充足。'},
      {key:'p', name:'速效磷', unit:'mg/kg', lo:20, hi:40, warnLo:12, warnHi:50,
       advLow:'速效磷不足，影响分蘖与根系，建议追施磷肥（过磷酸钙）或叶面喷施磷酸二氢钾。',
       advHigh:'磷素偏高，注意与锌拮抗，可暂缓施磷。',
       advOk:'磷素充足。'},
      {key:'k', name:'速效钾', unit:'mg/kg', lo:120, hi:220, warnLo:90, warnHi:250,
       advLow:'速效钾偏低，抗逆性下降，建议追施氯化钾/硫酸钾10-15kg/亩，增强抗倒伏能力。',
       advHigh:'钾素偏高，注意与其他阳离子平衡。',
       advOk:'钾素充足，利于壮秆抗倒。'}
    ],
    grow: [
      {key:'sc', name:'长势指数', unit:'分', lo:85, hi:100, warnLo:70, warnHi:100,
       advLow:'长势偏弱，建议优先纠正水温/水位/肥力异常项，叶面喷施磷酸二氢钾+芸苔素促进恢复。',
       advHigh:'长势优良。',
       advOk:'长势良好。'}
    ]
  };

  /* ---------- 指标判定工具 ---------- */
  function judge(r, v){
    if (v > r.hi)  return {st:'偏高', lv: v > r.warnHi ? 'bad' : 'warn', txt: r.advHigh};
    if (v < r.lo)  return {st:'偏低', lv: v < r.warnLo ? 'bad' : 'warn', txt: r.advLow};
    return {st:'正常', lv:'ok', txt: r.advOk};
  }

  /* ---------- 当前监测对象上下文 ---------- */
  function ctxText(kind, id){
    if (kind === 'gh') return id + '号大棚';
    return id + '号田';
  }

  /* ---------- 主诊断：返回结构化建议 ---------- */
  function diagnose(kind, id){
    var rules = kind === 'gh' ? GH_RULES : FARM_RULES;
    var data  = kind === 'gh' ? FarmData.DATA[id] : FarmData.FDATA[id];
    var name  = ctxText(kind, id);
    var items = [];
    Object.keys(rules).forEach(function(sec){
      rules[sec].forEach(function(r){
        var v = +data[sec][r.key];
        var j = judge(r, v);
        items.push({
          sec: sec, name: r.name, value: v, unit: r.unit, st: j.st, lv: j.lv, txt: j.txt
        });
      });
    });
    var bad = items.filter(function(i){ return i.lv !== 'ok'; });
    var ok  = items.filter(function(i){ return i.lv === 'ok'; });
    var score = +data.grow.sc;
    var overall = score >= 85 ? '生长状态良好'
      : score >= 70 ? '生长状态一般，存在可优化项'
      : '生长状态偏弱，建议尽快干预';
    var title = '【' + name + ' · ' + (kind==='gh'?'设施作物':'水稻田块') + '】' +
      (bad.length ? '共发现 ' + bad.length + ' 项指标需要关注' : '各项指标均在适宜区间');
    return {kind:kind, id:id, name:name, title:title, overall:overall, score:score, items:items, bad:bad, ok:ok};
  }

  /* ---------- 建议渲染成文本（供消息输出） ---------- */
  function adviceText(diag){
    var lines = [];
    lines.push('【' + diag.name + ' · 小农诊断】' + diag.overall + '（长势指数 ' + diag.score + ' 分）');
    if (!diag.bad.length){
      lines.push('当前各项测点数据均在适宜区间，维持现有农事安排即可：正常通风、按计划灌溉施肥。');
    } else {
      lines.push('需要关注的指标：');
      diag.bad.forEach(function(i){
        lines.push('① ' + i.name + ' ' + i.value + i.unit + '（' + i.st + '）：' + i.txt);
      });
      lines.push('其余指标正常，无需调整。');
    }
    return lines.join('\n');
  }

  /* ---------- 快捷建议：供 AI 面板快捷按钮使用 ---------- */
  function quickAdvice(kind, id){
    var diag = diagnose(kind, id);
    var html = '<div class="ai-num">【' + diag.name + '】' + diag.overall + '</div>';
    if (!diag.bad.length){
      html += '<div>各项指标均在适宜区间，维持当前管理方案即可。</div>';
    } else {
      diag.bad.forEach(function(i){
        html += '<div><span class="ai-' + i.lv + '">' + i.name + ' ' + i.value + i.unit + '（' + i.st + '）</span>：' + i.txt + '</div>';
      });
    }
    return html;
  }

  /* ---------- 对话：关键词匹配 + 实时数据上下文 ---------- */
  var KW = [
    {keys:['温度','高温','低温','热','冷','烫','冻'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.name.indexOf('温')>-1; });
      return it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>');
    }},
    {keys:['湿度','补水','加湿','干燥','湿'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.name.indexOf('湿度')>-1 || x.name.indexOf('水位')>-1 || x.name.indexOf('水')>-1; });
      return it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>');
    }},
    {keys:['浇','灌','水'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.name.indexOf('湿度')>-1 || x.name.indexOf('水位')>-1 || x.name.indexOf('溶解氧')>-1; });
      var cur = kind==='gh' ? FarmData.DATA[id].grow.ir+'L/亩' : FarmData.FDATA[id].grow.ir+'m³/亩';
      return (it.length ? it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>') : '各项水分指标正常。') + '<br><br>当前灌溉量：'+cur+'，按需调整。';
    }},
    {keys:['肥','施肥','养分','营养','氮','磷','钾','有机质','ec'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.sec==='soil'; });
      return it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>');
    }},
    {keys:['病','虫','害','药','杀菌','红蜘蛛','灰霉','白粉'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.bad.filter(function(x){ return x.name.indexOf('湿度')>-1 || x.name.indexOf('温度')>-1; });
      var env = it.length ? it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）'; }).join('、')+'。' : '各项环境指标正常，风险较低。';
      return '病虫害风险主要与环境有关。当前：'+env+'<br><br>预防建议：保持棚内通风降湿，雨后及时排湿；发现中心病株立即拔除并局部用药；常规预防可轮换使用保护性杀菌剂（如代森锰锌、吡唑醚菌酯），避免连续单一用药产生抗性。';
    }},
    {keys:['光','光照','补光','遮阳'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.name.indexOf('光')>-1; });
      return it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>');
    }},
    {keys:['产量','增收','增产','效益'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var g=FarmData.DATA[id].grow;
      var tip = d.bad.length ? '要进一步提升产量，建议优先解决：'+d.bad.map(function(x){ return x.name; }).join('、')+'。' : '产量表现良好，保持水肥管理即可稳步增收。';
      return '当前'+id+'号大棚今日产量 '+g.y+'kg，预估增产 '+g.up+'%，生长指数 '+g.sc+' 分。<br><br>'+tip;
    }},
    {keys:['水位','溶解氧','增氧','缺氧','藻'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var it=d.items.filter(function(x){ return x.name.indexOf('水位')>-1 || x.name.indexOf('溶解氧')>-1 || x.name.indexOf('泥温')>-1; });
      return it.map(function(x){ return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt; }).join('<br>');
    }},
    {keys:['长势','长得好','生长','苗'], ask:function(kind,id){
      var d=diagnose(kind,id);
      var g=FarmData.DATA[id].grow;
      var tip = d.bad.length ? '需关注：'+d.bad.map(function(x){ return x.name+'（'+x.st+'）'; }).join('、')+'。' : '各项指标良好。';
      return '当前'+id+'号大棚生长指数 '+g.sc+' 分，'+d.overall+'。'+tip+'<br><br>建议保持：白天通风、夜间保温，水肥按方案执行，定期巡查叶色与病虫害。';
    }},
    {keys:['你好','在吗','你是谁','介绍','能做什么'], ask:function(){
      return '我是小农，智慧农场农业智能助手，可结合大棚/农田各测点实时数据（温湿度、CO₂、土壤、水位、长势等）给出专业诊断与农事建议。你可以问我：「3号大棚温度怎么样」「4号田要不要浇水」「施肥建议」等。';
    }}
  ];
  function ask(question, kind, id){
    var q = String(question || '').toLowerCase();
    var diag = diagnose(kind, id);
    for (var i = 0; i < KW.length; i++){
      for (var j = 0; j < KW[i].keys.length; j++){
        if (q.indexOf(KW[i].keys[j]) > -1) return KW[i].ask(kind, id);
      }
    }
    return '关于「' + question + '」，我建议结合当前 ' + ctxText(kind, id) + ' 的实时数据来看：<br>' +
      (diag.bad.length ? diag.bad.map(function(x){return x.name+' '+x.value+x.unit+'（'+x.st+'）：'+x.txt;}).join('<br>') : '各项指标均在适宜区间，无需特殊干预。') +
      '<br><br>开发阶段升级后，我将接入大模型，能回答更开放的问题。';
  }

  /* ---------- 对外接口 ---------- */
  global.AIExpert = {
    diagnose: diagnose,
    adviceText: adviceText,
    quickAdvice: quickAdvice,
    ask: ask,
    ctxText: ctxText
  };
})(window);
