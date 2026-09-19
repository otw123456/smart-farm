/* ============================================================
   智慧农场综合管控平台 · 公共工具 common.js
   大屏自适应 / 实时时钟 / Toast / 模态框(弹窗下钻) / AI 悬浮智能体
   ============================================================ */
(function (global) {

  /* ========== 1. 任意屏幕自适应（1920×970 设计稿等比缩放居中） ========== */
  function fitStage(stageId){
    var stage = document.getElementById(stageId);
    if (!stage) return;
    function fit(){
      var s = Math.min(window.innerWidth / 1920, window.innerHeight / 970);
      stage.style.transform = 'scale(' + s + ')';
    }
    window.addEventListener('resize', fit);
    fit();
  }

  /* ========== 2. 实时时钟 ========== */
  function startClock(t1Id, t2Id){
    var t1 = document.getElementById(t1Id), t2 = document.getElementById(t2Id);
    if (!t1) return;
    function p(n){ return (n < 10 ? '0' : '') + n; }
    function tick(){
      var d = new Date();
      var wd = ['日','一','二','三','四','五','六'][d.getDay()];
      t1.textContent = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + ' 星期' + wd;
      if (t2) t2.textContent = d.getFullYear() + '-' + p(d.getMonth()+1) + '-' + p(d.getDate()) + ' · 数据实时刷新';
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ========== 3. Toast 提示 ========== */
  var toastTimer = null;
  function showToast(msg){
    var t = document.getElementById('toast');
    if (!t){
      t = document.createElement('div');
      t.id = 'toast'; t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ t.classList.remove('show'); }, 2400);
  }

  /* ========== 4. 模态框（弹窗 / 下钻详情） ========== */
  var modalEl = null, maskEl = null;
  function ensureModal(){
    if (modalEl) return;
    maskEl = document.createElement('div');
    maskEl.className = 'modal-mask';
    maskEl.addEventListener('click', function(e){ if (e.target === maskEl) closeModal(); });
    maskEl.innerHTML =
      '<div class="modal">' +
        '<div class="m-head">' +
          '<span class="dot"></span><h3 class="m-title"></h3><span class="m-sub"></span>' +
          '<span class="m-x">✕</span>' +
        '</div>' +
        '<div class="m-body"></div>' +
        '<div class="m-foot"><button class="m-close">关 闭</button></div>' +
      '</div>';
    document.body.appendChild(maskEl);
    modalEl = maskEl.querySelector('.modal');
    maskEl.querySelector('.m-x').addEventListener('click', closeModal);
    maskEl.querySelector('.m-close').addEventListener('click', closeModal);
  }
  function openModal(opts){
    ensureModal();
    maskEl.querySelector('.m-title').textContent = opts.title || '';
    maskEl.querySelector('.m-sub').textContent = opts.sub || '';
    maskEl.querySelector('.m-body').innerHTML = opts.bodyHTML || '';
    maskEl.classList.add('show');
  }
  function closeModal(){
    if (maskEl) maskEl.classList.remove('show');
  }

  /* ========== 5. AI 悬浮智能体「小农」 ========== */
  /*
   * initAI({ theme:'dark'|'light', getCtx:function()->{kind:'gh'|'farm', id:1..5, name:'3号大棚'} })
   * 悬浮球与面板均支持鼠标拖拽；形象为戴草帽的小农（纯 CSS 绘制）
   */
  function initAI(opts){
    opts = opts || {};
    var theme = opts.theme === 'light' ? 'light' : 'dark';
    var getCtx = opts.getCtx || function(){ return {kind:'gh', id:3, name:'3号大棚'}; };
    if (document.getElementById('aiFab')) return;

    /* --- 通用拖拽（限制在视口内，>3px 记为拖动） --- */
    function makeDraggable(el, handle){
      var sx, sy, ox, oy, moved;
      handle.style.cursor = 'grab';
      handle.addEventListener('mousedown', function(e){
        if (e.button !== 0) return;
        e.preventDefault();
        var r = el.getBoundingClientRect();
        sx = e.clientX; sy = e.clientY; ox = r.left; oy = r.top; moved = false;
        el.style.left = ox + 'px'; el.style.top = oy + 'px';
        el.style.right = 'auto'; el.style.bottom = 'auto';
        handle.style.cursor = 'grabbing';
        function move(ev){
          var dx = ev.clientX - sx, dy = ev.clientY - sy;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) moved = true;
          el.style.left = Math.min(Math.max(ox + dx, 0), window.innerWidth - el.offsetWidth) + 'px';
          el.style.top  = Math.min(Math.max(oy + dy, 0), window.innerHeight - el.offsetHeight) + 'px';
        }
        function up(){
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
          handle.style.cursor = 'grab';
          el.__dragged = moved;
        }
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    }

    /* --- 悬浮球：戴草帽的小农 --- */
    var fab = document.createElement('div');
    fab.id = 'aiFab';
    fab.className = 'ai-fab';
    fab.innerHTML =
      '<div class="blob"></div>' +
      '<img class="ai-img" src="img/ai.gif" alt="小农" draggable="false">';
    document.body.appendChild(fab);
    fab.style.right = '26px'; fab.style.bottom = '26px';
    makeDraggable(fab, fab);

    /* --- 面板（标题小农，头部可拖拽） --- */
    var panel = document.createElement('div');
    panel.className = 'ai-panel';
    panel.style.display = 'none';
    panel.innerHTML =
      '<div class="ai-head">' +
        '<div class="ai-ava"><img class="ai-ava-img" src="img/ai.gif" alt="小农"></div>' +
        '<div class="ai-meta"><b>小农 · 农业智能助手</b><span>在线 · 结合实时测点数据诊断</span></div>' +
        '<div class="ai-x">✕</div>' +
      '</div>' +
      '<div class="ai-msgs"></div>' +
      '<div class="ai-quick"></div>' +
      '<div class="ai-input"><input placeholder="输入你的农事问题，如：3号大棚温度怎么样 / 4号田要施肥吗"><button>发送</button></div>';
    document.body.appendChild(panel);
    makeDraggable(panel, panel.querySelector('.ai-head'));

    if (theme === 'light') document.body.classList.add('sys-theme');

    var msgs = panel.querySelector('.ai-msgs');
    var quick = panel.querySelector('.ai-quick');
    var input = panel.querySelector('input');
    var opened = false;

    function botMsg(html){
      var m = document.createElement('div');
      m.className = 'ai-msg bot';
      m.innerHTML = html;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function meMsg(text){
      var m = document.createElement('div');
      m.className = 'ai-msg me';
      m.textContent = text;
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
    }
    function typing(done){
      var m = document.createElement('div');
      m.className = 'ai-msg bot';
      m.innerHTML = '<span class="ai-typing"><i></i><i></i><i></i></span>';
      msgs.appendChild(m);
      msgs.scrollTop = msgs.scrollHeight;
      setTimeout(function(){ m.remove(); done(); }, 480 + Math.random() * 420);
    }
    function curName(){ return getCtx().name; }
    function curKind(){ return getCtx().kind; }
    function curId(){ return getCtx().id; }

    function welcome(){
      botMsg('你好呀，我是 <b>小农</b> 🌾<br>当前监测对象：<b>' + curName() + '</b>。' +
        '我可以根据它的各项测点数据，给你专业的诊断和农事建议～<br>' +
        '<div class="ai-sug"><span class="sg" data-q="诊断当前对象">🔍 立即诊断 ' + curName() + '</span></div>');
    }

    function buildQuick(){
      var qs = [
        ['诊断当前对象','诊断当前对象'],
        ['浇水 / 灌溉建议','要不要浇水'],
        ['施肥建议','施肥建议'],
        ['病虫害防治','病虫害怎么防治'],
        ['温度怎么调','温度怎么调'],
        ['产量分析','产量还能怎么提升']
      ];
      quick.innerHTML = qs.map(function(x){ return '<button data-q="' + x[1] + '">' + x[0] + '</button>'; }).join('');
    }

    function send(text){
      text = (text || '').trim();
      if (!text) return;
      meMsg(text);
      input.value = '';
      typing(function(){
        var ctx = getCtx();
        var reply = AIExpert.ask(text, ctx.kind, ctx.id);
        botMsg(reply);
      });
    }

    fab.addEventListener('click', function(){
      if (fab.__dragged) { fab.__dragged = false; return; }
      opened = !opened;
      panel.style.display = opened ? 'flex' : 'none';
      if (opened){
        msgs.innerHTML = '';
        buildQuick();
        welcome();
        input.focus();
      }
    });
    panel.querySelector('.ai-x').addEventListener('click', function(){
      opened = false; panel.style.display = 'none';
    });
    panel.querySelector('button').addEventListener('click', function(){ send(input.value); });
    input.addEventListener('keydown', function(e){ if (e.key === 'Enter') send(input.value); });
    quick.addEventListener('click', function(e){
      var b = e.target.closest('button');
      if (b) send(b.dataset.q);
    });
    msgs.addEventListener('click', function(e){
      var s = e.target.closest('.sg');
      if (s) send(s.dataset.q);
    });

    /* 供外部调用：打开面板 */
    global.AIExpertPanel = { open: function(){ if (!opened){ fab.click(); } } };
  }

  global.UI = {
    fitStage: fitStage,
    startClock: startClock,
    showToast: showToast,
    openModal: openModal,
    closeModal: closeModal,
    initAI: initAI
  };
})(window);
