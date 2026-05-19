// ROR Business System Network Visualization
(function() {
  var canvas = document.getElementById('networkCanvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var info = document.getElementById('networkInfo');
  var mobileContainer = document.getElementById('networkMobile');

  var ACCENT = '#6366f1';
  var ACCENT_RGB = '99,102,241';

  var nodes = [
    { id: 'core', label: 'Tyche', x: 0.5, y: 0.5, r: 36, color: ACCENT,
      desc: 'The operational layer that connects everything. Tyche reads, classifies, responds, routes, and follows up — so nothing falls between the cracks.',
      result: 'One system instead of ten disconnected tools.' },
    { id: 'inbound', label: 'Inbound\nHandling', x: 0.5, y: 0.15, r: 26,
      desc: 'Phone calls, web forms, text messages, emails — every channel feeds into a single intake system. Nothing gets lost in a voicemail box or buried in an inbox.',
      result: 'Every lead enters the system the moment it arrives.' },
    { id: 'response', label: 'First\nResponse', x: 0.72, y: 0.2, r: 26,
      desc: 'Within 60 seconds, the lead gets a reply. Not a template — a response based on what they actually asked for. The kind of answer that makes them stop calling other companies.',
      result: 'You respond first. You win the job.' },
    { id: 'phone', label: 'Phone\nCoverage', x: 0.85, y: 0.38, r: 24,
      desc: 'When you can\'t pick up — because you\'re on a roof, in a crawl space, or talking to another customer — calls still get answered, qualified, and routed to the right person.',
      result: 'No more "sorry I missed your call" voicemails.' },
    { id: 'scoring', label: 'Lead\nScoring', x: 0.85, y: 0.6, r: 26,
      desc: 'Every inbound gets classified: Is this urgent? Is it a real customer? What service do they need? What\'s the likely value? The system does the sorting your office manager does, but instantly.',
      result: 'Hot leads get attention. Junk gets filtered.' },
    { id: 'booking', label: 'Scheduling', x: 0.72, y: 0.78, r: 26,
      desc: 'Qualified leads go straight to the calendar. No back-and-forth, no "I\'ll call you to schedule," no dropped balls. The appointment gets booked before the lead loses interest.',
      result: 'More jobs on the calendar with less effort.' },
    { id: 'sms', label: 'Text\nFollow-Up', x: 0.5, y: 0.88, r: 24,
      desc: 'Automated text sequences at the right intervals. The estimate you sent last week gets a check-in. The lead who wasn\'t ready gets a nudge. None of it requires someone to remember.',
      result: 'Consistent follow-up without the mental load.' },
    { id: 'email', label: 'Email\nSequences', x: 0.28, y: 0.78, r: 24,
      desc: 'Longer-form nurture for leads that need time. Case studies, service explanations, seasonal reminders — all automated, all personalized, all on schedule.',
      result: 'Leads convert when they\'re ready, not when you remember.' },
    { id: 'pipeline', label: 'Pipeline\nManagement', x: 0.15, y: 0.6, r: 24,
      desc: 'Every lead, every status change, every interaction — visible in one place. No spreadsheets, no whiteboards, no guessing about where a job stands.',
      result: 'You always know what\'s in your pipeline.' },
    { id: 'tasks', label: 'Task\nRouting', x: 0.15, y: 0.38, r: 24,
      desc: 'Job assignments, status notifications, handoff reminders, escalation alerts. The operational work that keeps jobs moving — automated instead of manual.',
      result: 'Less time managing. More time on billable work.' },
    { id: 'reporting', label: 'Visibility', x: 0.28, y: 0.2, r: 24,
      desc: 'Where are your leads coming from? How fast are they getting answered? What\'s converting? What\'s not? Real numbers, not gut feelings.',
      result: 'Decisions based on data, not hunches.' },
    { id: 'reactivation', label: 'Past Client\nOutreach', x: 0.38, y: 0.35, r: 22,
      desc: 'Your past customers are your cheapest leads. Automated seasonal check-ins, maintenance reminders, and re-engagement campaigns bring them back without cold calling.',
      result: 'Revenue from the database you already have.' },
    { id: 'alerts', label: 'Team\nNotifications', x: 0.62, y: 0.35, r: 22,
      desc: 'Hot lead comes in — your phone buzzes. An estimate sits too long — your manager gets pinged. Something needs attention — the right person knows immediately.',
      result: 'The right people know at the right time.' },
    { id: 'intake', label: 'Web\nIntake', x: 0.38, y: 0.65, r: 22,
      desc: 'Your website isn\'t a brochure — it\'s an intake system. Forms built to capture the right information, feeding directly into the lead handling pipeline.',
      result: 'Better leads from the same website traffic.' },
    { id: 'reviews', label: 'Review\nManagement', x: 0.62, y: 0.65, r: 22,
      desc: 'After a completed job, the system requests a review. Automatically. At the right time. Your reputation grows without you having to ask awkwardly at the job site.',
      result: 'More reviews. Better reputation. More inbound.' },
  ];

  var edges = [
    ['core','inbound'],['core','response'],['core','phone'],['core','scoring'],
    ['core','booking'],['core','sms'],['core','email'],['core','pipeline'],
    ['core','tasks'],['core','reporting'],['core','alerts'],['core','reactivation'],
    ['core','intake'],['core','reviews'],
    ['inbound','response'],['response','scoring'],['scoring','booking'],
    ['scoring','alerts'],['response','phone'],['booking','pipeline'],
    ['sms','email'],['pipeline','tasks'],['tasks','reporting'],
    ['reactivation','email'],['reactivation','sms'],
    ['intake','inbound'],['booking','reviews'],
  ];

  var W, H, dpr, hovered = null, animT = 0;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    var rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = 600;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function px(node) { return { x: node.x * W, y: node.y * H }; }

  function draw() {
    animT += 0.008;
    ctx.clearRect(0, 0, W, H);

    edges.forEach(function(edge) {
      var a = edge[0], b = edge[1];
      var na = nodes.find(function(n) { return n.id === a; });
      var nb = nodes.find(function(n) { return n.id === b; });
      var pa = px(na), pb = px(nb);
      var isHighlight = hovered && (hovered.id === a || hovered.id === b);

      ctx.beginPath();
      ctx.moveTo(pa.x, pa.y);
      ctx.lineTo(pb.x, pb.y);

      if (isHighlight) {
        ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.5)';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.08)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      if (isHighlight) {
        var t = (animT * 2) % 1;
        var mx = pa.x + (pb.x - pa.x) * t;
        var my = pa.y + (pb.y - pa.y) * t;
        var grad = ctx.createRadialGradient(mx, my, 0, mx, my, 8);
        grad.addColorStop(0, 'rgba(' + ACCENT_RGB + ',0.6)');
        grad.addColorStop(1, 'rgba(' + ACCENT_RGB + ',0)');
        ctx.beginPath();
        ctx.arc(mx, my, 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    });

    nodes.forEach(function(node) {
      var p = px(node);
      var isCore = node.id === 'core';
      var isHovered = hovered && hovered.id === node.id;
      var isConnected = hovered && edges.some(function(e) {
        return (e[0] === hovered.id && e[1] === node.id) || (e[1] === hovered.id && e[0] === node.id);
      });
      var isActive = isHovered || isConnected || isCore;

      if (isHovered || isCore) {
        var glow = ctx.createRadialGradient(p.x, p.y, node.r * 0.5, p.x, p.y, node.r * 2.5);
        glow.addColorStop(0, 'rgba(' + ACCENT_RGB + ',' + (isHovered ? 0.15 : 0.08) + ')');
        glow.addColorStop(1, 'rgba(' + ACCENT_RGB + ',0)');
        ctx.beginPath();
        ctx.arc(p.x, p.y, node.r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, node.r, 0, Math.PI * 2);
      if (isCore) {
        ctx.fillStyle = 'rgba(' + ACCENT_RGB + ',0.15)';
        ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.6)';
        ctx.lineWidth = 2;
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(' + ACCENT_RGB + ',0.12)';
        ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.5)';
        ctx.lineWidth = 1.5;
      } else if (isConnected) {
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        ctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.3)';
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        ctx.strokeStyle = hovered ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)';
        ctx.lineWidth = 1;
      }
      ctx.fill();
      ctx.stroke();

      var lines = node.label.split('\n');
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var fontSize = isCore ? 14 : 10;
      ctx.font = (isCore ? '700 ' : '600 ') + fontSize + 'px Inter, sans-serif';
      ctx.fillStyle = isActive ? '#fff' : (hovered ? '#52525b' : '#a1a1aa');
      lines.forEach(function(line, i) {
        var offsetY = (i - (lines.length - 1) / 2) * (fontSize + 3);
        ctx.fillText(line, p.x, p.y + offsetY);
      });
    });

    requestAnimationFrame(draw);
  }

  function hitTest(mx, my) {
    for (var i = nodes.length - 1; i >= 0; i--) {
      var p = px(nodes[i]);
      var dx = mx - p.x, dy = my - p.y;
      if (dx * dx + dy * dy < nodes[i].r * nodes[i].r * 1.5) return nodes[i];
    }
    return null;
  }

  function showInfo(node) {
    if (!node || node.id === 'core') {
      info.classList.add('hidden');
      return;
    }
    document.getElementById('infoTitle').textContent = node.label.replace('\n', ' ');
    document.getElementById('infoDesc').textContent = node.desc;
    document.getElementById('infoResult').textContent = node.result;
    info.classList.remove('hidden');
  }

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    var node = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    hovered = node;
    canvas.style.cursor = node ? 'pointer' : 'default';
  });

  canvas.addEventListener('click', function(e) {
    var rect = canvas.getBoundingClientRect();
    var node = hitTest(e.clientX - rect.left, e.clientY - rect.top);
    showInfo(node);
  });

  canvas.addEventListener('mouseleave', function() { hovered = null; });

  document.querySelector('.info-close').addEventListener('click', function() {
    info.classList.add('hidden');
  });

  // Mobile fallback
  function buildMobile() {
    if (!mobileContainer) return;
    nodes.filter(function(n) { return n.id !== 'core'; }).forEach(function(node) {
      var card = document.createElement('div');
      card.style.cssText = 'display:flex;gap:12px;padding:16px;border-radius:10px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);';

      var dot = document.createElement('div');
      dot.style.cssText = 'width:8px;height:8px;border-radius:50%;background:#6366f1;margin-top:6px;flex-shrink:0;';
      card.appendChild(dot);

      var content = document.createElement('div');
      var strong = document.createElement('strong');
      strong.textContent = node.label.replace('\n', ' ');
      strong.style.cssText = 'display:block;font-size:0.8125rem;color:#fff;margin-bottom:4px;';
      content.appendChild(strong);

      var p = document.createElement('p');
      p.textContent = node.desc;
      p.style.cssText = 'font-size:0.75rem;color:#71717a;line-height:1.5;margin:0;';
      content.appendChild(p);

      card.appendChild(content);
      mobileContainer.appendChild(card);
    });
  }

  resize();
  buildMobile();
  draw();
  window.addEventListener('resize', resize);
})();
