// Tyche Demo — Simulated Lead Classification
(function() {
  var sampleData = [];
  var form = document.getElementById('leadForm');
  var timeline = document.getElementById('outputTimeline');
  var empty = document.getElementById('outputEmpty');
  var actions = document.getElementById('demoActions');
  var select = document.getElementById('sampleSelect');

  // Load sample leads
  fetch('sample-leads.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      sampleData = data;
      data.forEach(function(lead, i) {
        var opt = document.createElement('option');
        opt.value = i;
        opt.textContent = lead.name + ' — ' + lead.business;
        select.appendChild(opt);
      });
    })
    .catch(function() { /* samples unavailable, user can type manually */ });

  select.addEventListener('change', function() {
    if (this.value === '') return;
    var lead = sampleData[parseInt(this.value)];
    document.getElementById('leadName').value = lead.name;
    document.getElementById('leadBusiness').value = lead.business;
    document.getElementById('leadService').value = lead.service;
    document.getElementById('leadMessage').value = lead.message;
    document.getElementById('leadPhone').value = lead.phone;
    document.getElementById('leadEmail').value = lead.email;
  });

  // Classification engine
  function classify(lead) {
    var msg = (lead.message + ' ' + lead.service).toLowerCase();
    var hasPhone = lead.phone.trim().length > 6;
    var hasBusiness = lead.business.trim().length > 2;
    var hasEmail = lead.email.trim().length > 3;

    // Junk signals
    var junkWords = ['free trial', 'partnership', 'white-label', 'our platform',
      'demo of our', 'unsubscribe', 'click here', 'limited time offer',
      'schedule a demo of our', 'we noticed your company'];
    var isJunk = junkWords.some(function(w) { return msg.indexOf(w) !== -1; });
    if (isJunk) {
      return {
        cls: 'junk', confidence: 0.91,
        reason: 'Message contains vendor/sales pitch patterns. This is another business selling to ROR, not a lead.',
        route: 'Archive — no response needed. Auto-filtered.',
        response: null,
        questions: null
      };
    }

    // Hot signals
    var hotWords = ['asap', 'urgent', 'pricing', 'how much', 'cost', 'quote',
      'get started', 'set up', 'ready to', 'need help bad', 'losing', 'this week',
      'today', 'immediately', 'full system', 'everything'];
    var hotScore = hotWords.filter(function(w) { return msg.indexOf(w) !== -1; }).length;
    if ((hotScore >= 2 || (hotScore >= 1 && hasPhone)) && hasBusiness) {
      return {
        cls: 'hot', confidence: 0.94,
        reason: 'High intent detected: ' + (hasPhone ? 'phone provided, ' : '') +
          'business identified (' + lead.business + '), urgency signals in message.',
        route: 'ESCALATE to Frank immediately. Telegram alert sent. Draft response prepared for review.',
        response: 'Hi ' + lead.name.split(' ')[0] + ', thanks for reaching out to ROR Enterprises. ' +
          'I\'ve flagged your message as priority. Someone from our team will get back to you shortly.\n\n' +
          'If you\'d like to get on a call right away:\nhttps://cal.com/rorenterprises/15min\n\n' +
          'Or call us: (855) 514-5260\n\n— Tyche, AI Assistant, ROR Enterprises',
        questions: [
          'What\'s your current weekly lead volume?',
          'How quickly does someone usually respond to inbound leads right now?',
          'What\'s your average job value?'
        ]
      };
    }

    // Warm signals
    var warmWords = ['interested', 'learn more', 'curious', 'looking into',
      'how does', 'tell me about', 'want to chat', 'information', 'wondering'];
    var warmScore = warmWords.filter(function(w) { return msg.indexOf(w) !== -1; }).length;
    if (warmScore >= 1 || (hasEmail && hasBusiness)) {
      return {
        cls: 'warm', confidence: 0.82,
        reason: 'Interest signals detected but no urgency. ' +
          (hasBusiness ? 'Business identified. ' : 'No business name. ') +
          'Follow-up sequence recommended.',
        route: 'Auto-respond with value prop and booking link. Add to follow-up sequence. Include in daily digest.',
        response: 'Hi ' + lead.name.split(' ')[0] + ', thanks for your interest in ROR Enterprises.\n\n' +
          'We build AI-powered lead response systems for local service businesses — ' +
          'respond to every lead in under 60 seconds, qualify automatically, book appointments.\n\n' +
          'Want to see it in action? Book a quick call:\nhttps://cal.com/rorenterprises/15min\n\n' +
          '— Tyche, AI Assistant, ROR Enterprises',
        questions: [
          'What type of service business are you in?',
          'How many leads do you get per week?'
        ]
      };
    }

    // Cold
    return {
      cls: 'cold', confidence: 0.75,
      reason: 'Low intent — vague inquiry, no business context, no urgency signals.' +
        (!hasPhone ? ' No phone provided.' : '') +
        (!hasBusiness ? ' No business name.' : ''),
      route: 'Auto-respond with brief value prop. Add to long-cadence nurture sequence. No immediate alert.',
      response: 'Hi ' + lead.name.split(' ')[0] + ', thanks for reaching out.\n\n' +
        'ROR Enterprises helps local service businesses capture more leads with AI automation.\n\n' +
        'Curious? Book a call: https://cal.com/rorenterprises/15min\n\n' +
        '— Tyche, AI Assistant, ROR Enterprises',
      questions: null
    };
  }

  function createStep(delay, dotClass, labelClass, labelText, content) {
    var step = document.createElement('div');
    step.className = 'timeline-step delay-' + delay;

    var indicator = document.createElement('div');
    indicator.className = 'step-indicator';
    var dot = document.createElement('div');
    dot.className = 'step-dot ' + dotClass;
    indicator.appendChild(dot);
    var line = document.createElement('div');
    line.className = 'step-line';
    indicator.appendChild(line);
    step.appendChild(indicator);

    var contentDiv = document.createElement('div');
    contentDiv.className = 'step-content';
    var label = document.createElement('div');
    label.className = 'step-label ' + labelClass;
    label.textContent = labelText;
    contentDiv.appendChild(label);

    var bubble = document.createElement('div');
    bubble.className = 'step-bubble';
    if (typeof content === 'string') {
      bubble.textContent = content;
    } else {
      bubble.appendChild(content);
    }
    contentDiv.appendChild(bubble);
    step.appendChild(contentDiv);

    return step;
  }

  function createClassBadge(cls) {
    var badge = document.createElement('span');
    badge.className = 'class-badge class-' + cls;
    var labels = { hot: 'HOT LEAD', warm: 'WARM LEAD', cold: 'COLD LEAD', junk: 'JUNK / SPAM' };
    badge.textContent = labels[cls] || cls;
    return badge;
  }

  function runDemo(lead) {
    timeline.textContent = '';
    empty.classList.add('hidden');
    timeline.classList.remove('hidden');
    actions.classList.add('hidden');

    var result = classify(lead);

    // Step 1: Inbound received
    var inboundText = 'New lead received from ' + lead.name +
      (lead.business ? ' (' + lead.business + ')' : '') +
      '. Service: ' + (lead.service || 'Not specified') + '.';
    timeline.appendChild(createStep(1, 'active', 'sys', 'System', inboundText));

    // Step 2: Classification
    var classFragment = document.createDocumentFragment();
    var classBadge = createClassBadge(result.cls);
    classFragment.appendChild(classBadge);
    var confText = document.createElement('span');
    confText.textContent = ' (' + (result.confidence * 100).toFixed(0) + '% confidence)';
    confText.style.cssText = 'font-size:0.75rem;color:#71717a;margin-left:8px;';
    classFragment.appendChild(confText);
    var reasonP = document.createElement('p');
    reasonP.textContent = result.reason;
    reasonP.style.cssText = 'margin-top:8px;font-size:0.8125rem;color:#a1a1aa;';
    classFragment.appendChild(reasonP);
    timeline.appendChild(createStep(2, result.cls === 'hot' ? 'hot' : (result.cls === 'junk' ? '' : 'alert'),
      'classify', 'Tyche Classification', classFragment));

    // Step 3: Qualifying questions (if any)
    if (result.questions) {
      var qFragment = document.createDocumentFragment();
      var qIntro = document.createElement('p');
      qIntro.textContent = 'Tyche would ask these qualifying questions:';
      qIntro.style.cssText = 'margin-bottom:8px;font-size:0.8125rem;color:#a1a1aa;';
      qFragment.appendChild(qIntro);
      result.questions.forEach(function(q) {
        var qItem = document.createElement('p');
        qItem.textContent = '  "' + q + '"';
        qItem.style.cssText = 'font-size:0.8125rem;color:#d4d4d8;padding:2px 0;';
        qFragment.appendChild(qItem);
      });
      timeline.appendChild(createStep(3, 'active', 'tyche', 'Tyche — Qualification', qFragment));
    }

    // Step 4: Response
    var responseDelay = result.questions ? 4 : 3;
    if (result.response) {
      var respFragment = document.createDocumentFragment();
      var respLabel = document.createElement('p');
      respLabel.style.cssText = 'font-size:0.6875rem;color:#6366f1;margin-bottom:6px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;';
      respLabel.textContent = result.cls === 'hot' ? 'Draft response (pending Frank review):' : 'Auto-response sent:';
      respFragment.appendChild(respLabel);
      var respText = document.createElement('pre');
      respText.textContent = result.response;
      respText.style.cssText = 'white-space:pre-wrap;font-family:inherit;font-size:0.8125rem;color:#d4d4d8;line-height:1.6;';
      respFragment.appendChild(respText);
      timeline.appendChild(createStep(responseDelay, 'success', 'tyche', 'Tyche — Response', respFragment));
    }

    // Step 5: Routing
    var routeDelay = responseDelay + 1;
    var routeFragment = document.createDocumentFragment();
    var routeCard = document.createElement('div');
    routeCard.className = 'route-card';
    if (result.cls === 'hot') {
      routeCard.style.borderLeftColor = '#ef4444';
    } else if (result.cls === 'warm') {
      routeCard.style.borderLeftColor = '#f59e0b';
    } else if (result.cls === 'junk') {
      routeCard.style.borderLeftColor = '#71717a';
    }
    var routeP = document.createElement('p');
    routeP.textContent = result.route;
    routeCard.appendChild(routeP);
    routeFragment.appendChild(routeCard);
    timeline.appendChild(createStep(routeDelay, 'success', 'route', 'Routing Decision', routeFragment));

    // Step 6: Summary
    var summaryDelay = routeDelay + 1;
    var summaryText = 'Processing complete. ';
    if (result.cls === 'hot') {
      summaryText += 'This lead has been escalated to Frank with full context. Response time: simulated 47 seconds.';
    } else if (result.cls === 'warm') {
      summaryText += 'Auto-response sent. Lead added to follow-up sequence. Included in next daily digest.';
    } else if (result.cls === 'cold') {
      summaryText += 'Brief response sent. Lead added to long-cadence nurture. No immediate action needed.';
    } else {
      summaryText += 'Message archived. No response sent. Pattern logged for future filtering.';
    }
    timeline.appendChild(createStep(summaryDelay, 'success', 'sys', 'Complete', summaryText));

    // Show actions after last step animates
    setTimeout(function() {
      actions.classList.remove('hidden');
    }, (summaryDelay * 1200) + 800);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    var lead = {
      name: document.getElementById('leadName').value.trim(),
      business: document.getElementById('leadBusiness').value.trim(),
      service: document.getElementById('leadService').value.trim(),
      message: document.getElementById('leadMessage').value.trim(),
      phone: document.getElementById('leadPhone').value.trim(),
      email: document.getElementById('leadEmail').value.trim()
    };
    if (!lead.name || !lead.message) return;
    runDemo(lead);
  });

  document.getElementById('replayBtn').addEventListener('click', function() {
    timeline.classList.add('hidden');
    empty.classList.remove('hidden');
    actions.classList.add('hidden');
    form.reset();
    select.value = '';
  });
})();
