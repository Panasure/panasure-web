(function () {
  var d = document;
  function open(url) { var win = window.open(url, '_blank'); if (win) { win.opener = null; } else { location.href = url; } }

  // Cotizador por pasos
  var TIPOS = {
    auto: { nombre: 'Auto', frase: 'un seguro de auto', qs: [['Cobertura', '¿Qué cobertura buscas?', ['Completa', 'Daños a terceros', 'No estoy seguro']], ['Año del auto', '¿De qué año es tu auto?', ['2023 o más nuevo', '2018 a 2022', '2017 o anterior']]] },
    salud: { nombre: 'Salud', frase: 'un seguro de salud', qs: [['Asegurar a', '¿A quién quieres asegurar?', ['Solo a mí', 'Mi pareja y yo', 'Mi familia']], ['Tipo de plan', '¿Qué tipo de plan prefieres?', ['Local', 'Internacional', 'No estoy seguro']]] },
    vida: { nombre: 'Vida', frase: 'un seguro de vida', qs: [['Busco', '¿Qué buscas?', ['Solo protección', 'Protección con ahorro', 'No estoy seguro']], ['Edad', '¿Cuál es tu edad?', ['Menos de 35', '35 a 50', 'Más de 50']]] },
    hogar: { nombre: 'Hogar', frase: 'un seguro de hogar', qs: [['Vivienda', 'Tu vivienda es…', ['Propia', 'Alquilada']], ['Asegurar', '¿Qué quieres asegurar?', ['La estructura', 'Lo que hay dentro', 'Ambos']]] },
    empresa: { nombre: 'Empresa', frase: 'un seguro para mi empresa', qs: [['Necesito asegurar', '¿Qué necesitas asegurar?', ['Local o bienes', 'Vehículos', 'Colaboradores', 'Fianzas']], ['Colaboradores', '¿Cuántos colaboradores tienen?', ['1 a 10', '11 a 50', 'Más de 50']]] },
    otro: { nombre: 'Otro', frase: 'un seguro', qs: [['Tipo de seguro', '¿Qué seguro necesitas?', ['Viaje', 'Accidentes personales', 'Fianza', 'Otro']]] }
  };
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  d.querySelectorAll('.wiz').forEach(function (w) {
    var steps = w.querySelectorAll('.wiz-step'), pasos = w.querySelectorAll('.wiz-stepper li');
    var qsBox = w.querySelector('.wiz-qs'), next = w.querySelector('.wiz-next'), send = w.querySelector('.wiz-send');
    var name = w.querySelector('.wiz-name'), msgEl = w.querySelector('.wiz-msg'), pill = w.querySelector('.wiz-pill span:last-child'), pIco = w.querySelector('.wiz-pill .ico-tile');
    var st = { tipo: null, ans: {}, horario: 'lo antes posible', url: '' };
    function show(n, back, foco) {
      steps.forEach(function (s) {
        var on = +s.getAttribute('data-step') === n;
        s.classList.toggle('is-on', on);
        s.classList.toggle('from-back', on && !!back);
      });
      pasos.forEach(function (li, k) {
        li.classList.toggle('is-done', k + 1 < n); li.classList.toggle('is-cur', k + 1 === n);
        if (k + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      if (foco) {
        var f = n === 3 ? name : w.querySelector('.wiz-step.is-on button:not(.wiz-back)');
        if (f) f.focus({ preventScroll: true });
      }
      if (n === 4) { var dr = w.querySelector('.wiz-done .draw'); if (dr) { dr.classList.remove('in'); void dr.getBoundingClientRect(); dr.classList.add('in'); } }
    }
    function completo() { return st.tipo && TIPOS[st.tipo].qs.every(function (q) { return st.ans[q[0]]; }); }
    function mensaje() {
      var t = 'Hola Panasure' + (name.value.trim() ? ', soy ' + name.value.trim() : '') + '. Quiero cotizar ' + TIPOS[st.tipo].frase + '.';
      TIPOS[st.tipo].qs.forEach(function (q) { if (st.ans[q[0]]) t += ' ' + q[0] + ': ' + st.ans[q[0]].toLowerCase() + '.'; });
      return t;
    }
    function actualizar() {
      if (!st.tipo) return;
      msgEl.textContent = mensaje();
      st.url = 'https://wa.me/50767872717?text=' + encodeURIComponent(mensaje());
      send.disabled = name.value.trim().length < 2;
    }
    function elegir(tipo) {
      st.tipo = tipo; st.ans = {};
      w.querySelectorAll('.wiz-tile').forEach(function (t) { t.setAttribute('aria-pressed', t.getAttribute('data-tipo') === tipo ? 'true' : 'false'); });
      pIco.innerHTML = w.querySelector('.wiz-tile[data-tipo="' + tipo + '"] .ico-tile').innerHTML;
      pill.textContent = 'Seguro de ' + TIPOS[tipo].nombre.toLowerCase();
      if (tipo === 'empresa') pill.textContent = 'Seguro para empresa';
      if (tipo === 'otro') pill.textContent = 'Otro seguro';
      qsBox.innerHTML = TIPOS[tipo].qs.map(function (q) {
        return '<div class="wiz-group" role="group" aria-label="' + esc(q[1]) + '"><p class="wiz-q">' + esc(q[1]) + '</p><div class="wiz-chips" data-k="' + esc(q[0]) + '">' +
          q[2].map(function (o) { return '<button type="button" class="chip" aria-pressed="false" data-v="' + esc(o) + '">' + esc(o) + '</button>'; }).join('') + '</div></div>';
      }).join('');
      next.disabled = true; next.style.display = '';
      if (tipo === 'auto' && d.querySelector('.ao')) {
        qsBox.innerHTML = '<div class="ao-teaser"><span class="ico-tile">' + pIco.innerHTML + '</span><div><strong>Cotiza tu auto en 4 pasos</strong><span>Cobertura, datos del auto y listo.</span></div><button type="button" class="btn btn-dark" data-auto-open>Empezar</button></div>';
        next.style.display = 'none';
      }
      actualizar();
    }
    w.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !w.contains(b)) return;
      if (b.classList.contains('wiz-tile')) { if (b.getAttribute('data-tipo') === 'auto' && d.querySelector('.ao')) { d.querySelector('.ao').__open(); return; } elegir(b.getAttribute('data-tipo')); setTimeout(function () { show(2, false, true); }, 220); return; }
      if (b.classList.contains('chip')) {
        var g = b.closest('.wiz-chips'), k = g.getAttribute('data-k');
        g.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        if (k === 'horario') { st.horario = b.getAttribute('data-v'); } else {
          st.ans[k] = b.getAttribute('data-v'); next.disabled = !completo();
          var gs = qsBox.querySelectorAll('.wiz-chips');
          if (completo() && g === gs[gs.length - 1]) setTimeout(function () { show(3, false, true); }, 450);
        }
        actualizar(); return;
      }
      if (b.classList.contains('wiz-reset')) {
        st.tipo = null; st.ans = {}; name.value = '';
        w.querySelectorAll('.wiz-tile').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
        show(1, true, true);
        return;
      }
      if (b.classList.contains('wiz-next')) { if (completo()) show(3, false, true); return; }
      if (b.classList.contains('wiz-back')) { var on = w.querySelector('.wiz-step.is-on'); show(+on.getAttribute('data-step') - 1, true, true); return; }
      if (b.classList.contains('wiz-send')) {
        if (send.disabled) { name.focus(); return; }
        actualizar(); open(st.url);
        w.querySelector('.wiz-hola').textContent = '¡Listo, ' + name.value.trim().split(' ')[0] + '!';
        w.querySelector('.wiz-reopen').href = st.url;
        show(4, false, false); return;
      }
    });
    name.addEventListener('input', actualizar);
    name.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send.click(); } });
    var pre = w.getAttribute('data-preset');
    if (pre && TIPOS[pre]) { elegir(pre); show(2, false, false); } else { show(1, false, false); }
  });

  // Cotizador de auto
  var ao = d.querySelector('.ao');
  if (ao) {
    var MODELOS = {
      'Toyota': ['Corolla', 'Corolla Cross', 'Yaris', 'Hilux', 'RAV4', 'Fortuner', 'Rush', 'Raize', 'Land Cruiser Prado'],
      'Hyundai': ['Accent', 'Elantra', 'Grand i10', 'Venue', 'Creta', 'Tucson', 'Santa Fe'],
      'Kia': ['Picanto', 'Soluto', 'Rio', 'K3', 'Seltos', 'Sportage', 'Sorento'],
      'Nissan': ['Versa', 'Sentra', 'Kicks', 'Qashqai', 'X-Trail', 'Frontier', 'Navara'],
      'Mitsubishi': ['Mirage', 'Xpander', 'ASX', 'Outlander', 'Montero Sport', 'L200'],
      'Suzuki': ['Celerio', 'Swift', 'Dzire', 'Ertiga', 'Vitara', 'Jimny'],
      'Honda': ['City', 'Civic', 'HR-V', 'CR-V', 'Pilot'],
      'Mazda': ['Mazda2', 'Mazda3', 'CX-3', 'CX-30', 'CX-5', 'BT-50'],
      'Chevrolet': ['Spark', 'Onix', 'Tracker', 'Captiva', 'Colorado'],
      'Ford': ['Territory', 'Escape', 'Explorer', 'Ranger'],
      'Volkswagen': ['Polo', 'Virtus', 'T-Cross', 'Tiguan', 'Amarok'],
      'Geely': ['Coolray', 'Emgrand', 'Okavango'],
      'Chery': ['Tiggo 2', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8'],
      'BMW': ['Serie 3', 'X1', 'X3', 'X5'],
      'Mercedes-Benz': ['Clase A', 'Clase C', 'GLA', 'GLC']
    };
    var MOD_T = {"Corolla": "sedan", "Corolla Cross": "suv", "Yaris": "hatch", "Hilux": "pickup", "RAV4": "suv", "Fortuner": "suv", "Rush": "suv", "Raize": "suv", "Land Cruiser Prado": "suv", "Accent": "sedan", "Elantra": "sedan", "Grand i10": "hatch", "Venue": "suv", "Creta": "suv", "Tucson": "suv", "Santa Fe": "suv", "Picanto": "hatch", "Soluto": "sedan", "Rio": "hatch", "K3": "sedan", "Seltos": "suv", "Sportage": "suv", "Sorento": "suv", "Versa": "sedan", "Sentra": "sedan", "Kicks": "suv", "Qashqai": "suv", "X-Trail": "suv", "Frontier": "pickup", "Navara": "pickup", "Mirage": "hatch", "Xpander": "suv", "ASX": "suv", "Outlander": "suv", "Montero Sport": "suv", "L200": "pickup", "Celerio": "hatch", "Swift": "hatch", "Dzire": "sedan", "Ertiga": "suv", "Vitara": "suv", "Jimny": "suv", "City": "sedan", "Civic": "sedan", "HR-V": "suv", "CR-V": "suv", "Pilot": "suv", "Mazda2": "hatch", "Mazda3": "sedan", "CX-3": "suv", "CX-30": "suv", "CX-5": "suv", "BT-50": "pickup", "Spark": "hatch", "Onix": "sedan", "Tracker": "suv", "Captiva": "suv", "Colorado": "pickup", "Territory": "suv", "Escape": "suv", "Explorer": "suv", "Ranger": "pickup", "Polo": "hatch", "Virtus": "sedan", "T-Cross": "suv", "Tiguan": "suv", "Amarok": "pickup", "Coolray": "suv", "Emgrand": "sedan", "Okavango": "suv", "Tiggo 2": "suv", "Tiggo 4": "suv", "Tiggo 7": "suv", "Tiggo 8": "suv", "Serie 3": "sedan", "X1": "suv", "X3": "suv", "X5": "suv", "Clase A": "hatch", "Clase C": "sedan", "GLA": "suv", "GLC": "suv"}, MAR_T = {"Toyota": "sedan", "Hyundai": "hatch", "Kia": "hatch", "Nissan": "pickup", "Mitsubishi": "suv", "Suzuki": "hatch", "Honda": "sedan", "Mazda": "coupe", "Chevrolet": "hatch", "Ford": "pickup", "Volkswagen": "hatch", "Geely": "suv", "Chery": "suv", "BMW": "coupe", "Mercedes-Benz": "coupe"};
    function carro() { var m = as.modelo.trim().toLowerCase(), k = Object.keys(MOD_T).filter(function (x) { return x.toLowerCase() === m; })[0]; return (k && MOD_T[k]) || MAR_T[as.marca] || 'sedan'; }
    function pintaCarro() {
      var t = carro();
      ao.querySelectorAll('.ao-big').forEach(function (g) { g.classList.toggle('on', g.classList.contains('ao-big-' + t)); });
      ao.querySelector('.ao-stage').classList.toggle('ready', !!as.marca);
    }
    var as = { cob: '', marca: '', modelo: '', anio: '', uso: '', valor: 20000, fin: '', nombre: '', poliza: '' }, paso = 1, antes = null;
    var aSteps = ao.querySelectorAll('.ao-step'), aLis = ao.querySelectorAll('.ao-stepper li');
    var aNext = ao.querySelector('.ao-next'), aPrev = ao.querySelector('.ao-prev'), aMain = ao.querySelector('.ao-main');
    var otra = ao.querySelector('.ao-otra'), full = ao.querySelector('.ao-full'), dl = ao.querySelector('#ao-models');
    var dinero = function (n) { return '$' + Number(n).toLocaleString('en-US'); };
    var completa = function () { return as.cob === 'Cobertura completa'; };
    function valido(n) {
      if (n === 1) return !!as.cob;
      if (n === 2) return !!(as.marca && as.modelo.trim() && as.anio && as.uso && (!completa() || as.fin));
      if (n === 3) return as.nombre.trim().length > 1 && !!as.poliza;
      return true;
    }
    function vehiculo() { return [as.marca, as.modelo.trim(), as.anio].filter(Boolean).join(' '); }
    function filas() {
      var f = [['Cobertura', as.cob], ['Vehículo', vehiculo()], ['Uso', as.uso && as.uso.charAt(0).toUpperCase() + as.uso.slice(1)]];
      if (completa()) { f.push(['Valor', dinero(as.valor) + (as.valor >= 100000 ? '+' : '')]); f.push(['Financiado', as.fin && as.fin.charAt(0).toUpperCase() + as.fin.slice(1)]); }
      f.push(['Póliza vigente', as.poliza && as.poliza.charAt(0).toUpperCase() + as.poliza.slice(1)]);
      return f;
    }
    function resumen() {
      ao.querySelector('.ao-car-n').textContent = vehiculo() || 'Tu auto';
      ao.querySelector('.ao-car-d').textContent = [as.uso && (as.uso.charAt(0).toUpperCase() + as.uso.slice(1)), as.cob].filter(Boolean).join(' · ') || 'Completa los datos';
      ao.querySelector('.ao-dl').innerHTML = filas().map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + (r[1] ? esc(r[1]) : '<span class="ao-empty">—</span>') + '</dd></div>'; }).join('');
    }
    function mensajeAuto() {
      var t = 'Hola Panasure, soy ' + as.nombre.trim() + '. Quiero cotizar un seguro de auto.';
      t += ' Cobertura: ' + ({ 'Cobertura completa': 'completa', 'Daños a terceros': 'daños a terceros', 'Necesito asesoría': 'necesito asesoría' })[as.cob] + '. Vehículo: ' + vehiculo() + '. Uso: ' + as.uso + '.';
      if (completa()) t += ' Valor aproximado: ' + dinero(as.valor) + (as.valor >= 100000 ? ' o más' : '') + '. Financiado: ' + as.fin + '.';
      return t + ' Póliza vigente: ' + as.poliza + '.';
    }
    function ir(n, atras) {
      paso = n;
      aSteps.forEach(function (sec) { var on = +sec.getAttribute('data-s') === n; sec.classList.toggle('is-on', on); sec.classList.toggle('from-back', on && !!atras); });
      aLis.forEach(function (li, k) { li.classList.toggle('is-done', k + 1 < n); li.classList.toggle('is-cur', k + 1 === n); });
      aPrev.style.visibility = (n === 1 || n === 5) ? 'hidden' : 'visible';
      ao.querySelector('.ao-foot').hidden = n === 5;
      aNext.style.display = n >= 4 ? 'none' : '';
      ao.querySelector('.ao-send').hidden = n !== 4;
      aNext.disabled = !valido(n);
      full.hidden = !completa();
      if (n === 4) {
        ao.querySelector('.ao-review').innerHTML = '<div class="ao-car ao-car-big"><span class="ao-rev-sil">' + ao.querySelector('.ao-big.on').outerHTML + '</span><div><strong>' + esc(vehiculo()) + '</strong><span>' + esc(as.cob) + '</span></div></div><dl class="ao-dl">' +
          filas().filter(function (r) { return r[0] !== 'Vehículo' && r[0] !== 'Cobertura'; }).map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '<div><dt>A nombre de</dt><dd>' + esc(as.nombre.trim()) + '</dd></div></dl>';
      }
      if (n === 5) { var dr = ao.querySelector('.ao-done .draw'); dr.classList.remove('in'); void dr.getBoundingClientRect(); dr.classList.add('in'); }
      aMain.scrollTop = 0;
      var h = ao.querySelector('.ao-step.is-on .ao-h'); if (h && ao.classList.contains('on')) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    function abrir() {
      antes = d.activeElement; ao.hidden = false; d.documentElement.classList.add('ao-lock');
      requestAnimationFrame(function () { ao.classList.add('on'); ir(paso === 5 ? 1 : paso); });
    }
    function cerrar() {
      ao.classList.remove('on'); d.documentElement.classList.remove('ao-lock');
      setTimeout(function () { ao.hidden = true; if (paso === 5) reiniciar(); }, 320);
      if (antes && antes.focus) antes.focus({ preventScroll: true });
    }
    function reiniciar() {
      as = { cob: '', marca: '', modelo: '', anio: '', uso: '', valor: 20000, fin: '', nombre: '', poliza: '' }; paso = 1;
      ao.querySelectorAll('[aria-pressed="true"]').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      ao.querySelectorAll('input:not([type=range]), select').forEach(function (i) { i.value = ''; });
      ao.querySelector('.ao-range').value = 20000; ao.querySelector('.ao-value').textContent = dinero(20000);
      otra.hidden = true; filtrar(''); resumen(); pintaCarro();
    }
    function filtrar(q) {
      q = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      ao.querySelectorAll('.ao-brand').forEach(function (b) { var v = b.getAttribute('data-v'); b.hidden = !!q && v !== '__otra' && v.toLowerCase().indexOf(q) === -1; });
    }
    function cambio() { resumen(); pintaCarro(); aNext.disabled = !valido(paso); full.hidden = !completa(); }
    ao.__open = abrir;
    ao.addEventListener('click', function (e) {
      var b = e.target.closest('button, [data-ao-close]'); if (!b || !ao.contains(b)) return;
      if (b.hasAttribute('data-ao-close')) { cerrar(); return; }
      if (b.classList.contains('ao-cov') || b.classList.contains('ao-help')) {
        as.cob = b.getAttribute('data-v');
        ao.querySelectorAll('.ao-cov, .ao-help').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        if (!completa()) as.fin = '';
        cambio(); setTimeout(function () { if (paso === 1) ir(2); }, 320); return;
      }
      if (b.classList.contains('ao-brand')) {
        ao.querySelectorAll('.ao-brand').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        var v = b.getAttribute('data-v');
        if (v === '__otra') { otra.hidden = false; as.marca = otra.value.trim(); otra.focus(); dl.innerHTML = ''; }
        else { otra.hidden = true; as.marca = v; dl.innerHTML = (MODELOS[v] || []).map(function (m) { return '<option value="' + esc(m) + '">'; }).join(''); }
        cambio(); return;
      }
      if (b.classList.contains('chip')) {
        var g = b.closest('.wiz-chips'); g.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
        as[g.getAttribute('data-k')] = b.getAttribute('data-v'); cambio(); return;
      }
      if (b.classList.contains('ao-next')) { if (valido(paso)) ir(paso + 1); return; }
      if (b.classList.contains('ao-prev')) { ir(paso - 1, true); return; }
      if (b.classList.contains('ao-send')) {
        var url = 'https://wa.me/50767872717?text=' + encodeURIComponent(mensajeAuto());
        open(url); ao.querySelector('.ao-reopen').href = url;
        ao.querySelector('.ao-hola').textContent = '¡Listo, ' + as.nombre.trim().split(' ')[0] + '!';
        ir(5); return;
      }
    });
    ao.querySelector('.ao-search').addEventListener('input', function (e) { filtrar(e.target.value); });
    otra.addEventListener('input', function () { as.marca = otra.value.trim(); cambio(); });
    ao.querySelector('.ao-modelo').addEventListener('input', function (e) { as.modelo = e.target.value; cambio(); });
    ao.querySelector('.ao-anio').addEventListener('change', function (e) { as.anio = e.target.value; cambio(); });
    ao.querySelector('.ao-nombre').addEventListener('input', function (e) { as.nombre = e.target.value; cambio(); });
    ao.querySelector('.ao-range').addEventListener('input', function (e) { as.valor = +e.target.value; ao.querySelector('.ao-value').textContent = dinero(as.valor) + (as.valor >= 100000 ? '+' : ''); cambio(); });
    ao.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { cerrar(); return; }
      if (e.key === 'Enter' && e.target.tagName === 'INPUT' && valido(paso) && paso < 4) { e.preventDefault(); ir(paso + 1); return; }
      if (e.key !== 'Tab') return;
      var f = Array.prototype.filter.call(ao.querySelectorAll('button:not([disabled]), input:not([hidden]), select, a[href]'), function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && d.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && d.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
    resumen(); pintaCarro(); ir(1);
  }
  if (!window.__aoDoc) {
    window.__aoDoc = 1;
    d.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('[data-auto-open]'); if (!t) return;
      var a = d.querySelector('.ao'); if (a && a.__open) { e.preventDefault(); a.__open(); }
    });
  }

  // Palabra que rota en el titular
  var quieto = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rw = d.querySelector('.rot-w');
  if (rw && !quieto && !window.__rot) {
    var palabras = ['auto.', 'salud.', 'familia.', 'hogar.', 'negocio.'], ri = 0;
    var ancho = function (el) { var r = d.createRange(); r.selectNodeContents(el); el.parentNode.style.setProperty('--sw', (r.getBoundingClientRect().width * 0.92).toFixed(1) + 'px'); };
    ancho(rw);
    window.__rot = setInterval(function () {
      var el = d.querySelector('.rot-w'); if (!el) return;
      el.classList.add('out');
      setTimeout(function () {
        ri = (ri + 1) % palabras.length; el.textContent = palabras[ri]; ancho(el);
        el.classList.remove('out'); el.classList.add('pre');
        void el.offsetWidth; el.classList.remove('pre');
      }, 380);
    }, 2600);
  }

  // Indicadores de los carruseles en móvil
  d.querySelectorAll('.m-scroll').forEach(function (sc) {
    var n = sc.children.length; if (n < 2) return;
    var dots = d.createElement('div'); dots.className = 'm-dots'; dots.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < n; i++) dots.appendChild(d.createElement('span'));
    sc.parentNode.insertBefore(dots, sc.nextSibling);
    var pend = false;
    function marca() {
      pend = false;
      var w = sc.children[0].getBoundingClientRect().width + 12, i = Math.round(sc.scrollLeft / w);
      if (sc.scrollLeft + sc.clientWidth >= sc.scrollWidth - 4) i = n - 1;
      Array.prototype.forEach.call(dots.children, function (s, k) { s.classList.toggle('on', k === i); });
    }
    sc.addEventListener('scroll', function () { if (!pend) { pend = true; requestAnimationFrame(marca); } }, { passive: true });
    marca();
  });

  // Cabecera y botón flotante
  var hdr = d.querySelector('.glasswrap'), fl = d.querySelector('.wa-float'), cot = d.getElementById('cotizar');
  var formaVisible = false;
  var oscuros = '.hero, .band-rich, .cta-rich, .cta-deep, footer', tq = false, par = d.querySelector('.hero > .loop-bg');
  function tono() {
    tq = false;
    if (!hdr || !d.elementsFromPoint) return;
    var y = Math.max(1, hdr.getBoundingClientRect().bottom - 22);
    var capas = d.elementsFromPoint(window.innerWidth / 2, y), oscuro = true;
    for (var i = 0; i < capas.length; i++) {
      if (hdr.contains(capas[i]) || capas[i].classList.contains('wa-float')) continue;
      oscuro = !!capas[i].closest(oscuros); break;
    }
    hdr.classList.toggle('light', !oscuro);
    var linea = window.innerHeight * 0.38;
    spy.forEach(function (it) {
      var r = it.el.getBoundingClientRect(), on = r.top <= linea && r.bottom > linea;
      it.a.classList.toggle('is-active', on);
      if (on) it.a.setAttribute('aria-current', 'location'); else it.a.removeAttribute('aria-current');
    });
  }
  var spy = [];
  d.querySelectorAll('.hdr-nav a').forEach(function (a) {
    if (a.pathname !== location.pathname || !a.hash) return;
    var el = d.getElementById(a.hash.slice(1));
    if (el) spy.push({ a: a, el: el });
  });
  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('scrolled', y > 24);
    if (!tq) { tq = true; requestAnimationFrame(tono); }
    if (fl) fl.classList.toggle('show', y > 480 && !formaVisible);
    if (par && !quieto && y < window.innerHeight * 1.2) par.style.translate = '0 ' + (y * 0.22).toFixed(1) + 'px';
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Animaciones al bajar
  var els = d.querySelectorAll('.reveal, .draw');
  if ('IntersectionObserver' in window) {
    if (cot) new IntersectionObserver(function (es) { formaVisible = es[0].isIntersecting; onScroll(); }, { threshold: 0.2 }).observe(cot);
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.1 });
    els.forEach(function (el) {
      var hermanos = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.classList.contains('reveal'); }) : [];
      var i = hermanos.indexOf(el);
      if (i > 0) el.style.setProperty('--d', (Math.min(i, 5) * 0.07) + 's');
      io.observe(el);
    });
  } else {
    els.forEach(function (el) { el.classList.add('in'); });
  }
  onScroll();

  // Brillo del vidrio que sigue el cursor
  if (window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var pend = null, ev = null;
    d.addEventListener('pointermove', function (e) {
      ev = e;
      if (pend) return;
      pend = requestAnimationFrame(function () {
        pend = null;
        var el = ev.target.closest && ev.target.closest('.lift');
        if (!el) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
        el.style.setProperty('--my', (ev.clientY - r.top) + 'px');
      });
    }, { passive: true });
  }
})();
