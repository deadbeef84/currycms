(function(w) {
  function create(tagName, properties, attributes, children) {
    var el = document.createElement(tagName), i;
    if (Array.isArray(properties)) {
      children = properties;
      properties = undefined;
      attributes = undefined;
    } else if (Array.isArray(attributes)) {
      children = attributes;
      attributes = undefined;
    }
    if (typeof properties !== "undefined") {
      for (i in properties) {
        el[i] = properties[i];
      }
    }
    if (typeof attributes !== "undefined") {
      for (i in attributes) {
        el.setAttribute(i, attributes[i]);
      }
    }
    if (typeof children !== "undefined") {
      for (i in children) {
        el.appendChild(children[i]);
      }
    }
    return el;
  }
  function param(data) {
    var params = [];
    for(k in data) {
      if (data[k] !== null && typeof data[k] !== 'undefined')
        params.push(encodeURIComponent(k) + '=' + encodeURIComponent(data[k]));
    }
    return params.join('&');
  }
  function xhr(url, data, success, error) {
    var request = new XMLHttpRequest();
    if (typeof data === "object")
      data = param(data);
    if (data)
      url += (url.indexOf('?') !== -1 ? '&' : '?') + data;
    request.open('GET', url, true);
    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        success && success(JSON.parse(request.responseText));
      } else {
        error && error(request);
      }
    };
    request.onerror = function() {
      error && error(request);
    };
    request.send();
    return request;
  }
  function extend(out) {
    out = out || {};
    for (var i = 1; i < arguments.length; i++) {
      if (!arguments[i])
        continue;
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key))
          out[key] = arguments[i][key];
      }
    }
    return out;
  }
  var matches = function(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  };

  function Grid(dom, options) {
    var self = this, id;
    this.dom = dom;
    this.options = extend({}, Grid.defaultOptions, options);
    for(id in this.options.columns) {
      this.options.columns[id] = extend({}, Grid.defaultColumnOptions, {label: id}, this.options.columns[id]);
    }
    for(id in this.options.actions) {
      this.options.actions[id] = extend({}, Grid.defaultActionOptions, {label: id}, this.options.actions[id]);
    }
    this.sortColumn = null;
    this.sortOrder = 'asc';
    this.rows = [];
    this.selected = [];
    this.init();
    this.load();
  }

  Grid.prototype.init = function () {
    var template = Grid.templates[this.options.template];
    this.template = new template(this);
  };
  Grid.prototype.toggleSort = function (column) {
    if (column === this.sortColumn) {
      this.sortOrder = (this.sortOrder == 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn = column;
      this.sortOrder = 'asc';
    }
    this.template.buildMain();
    this.load();
  };
  Grid.prototype.select = function (rowIndex, value) {
    if (value)
      this.selected.push(rowIndex);
    else
      this.selected.splice(this.selected.indexOf(rowIndex), 1);
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, false);
    this.dom.dispatchEvent(event);
  };
  Grid.prototype.getSelected = function () {
    var self = this;
    return this.selected.map(function(index) {
      return self.rows[index][self.options.idColumn];
    });
  };
  Grid.prototype.load = function () {
    var self = this;
    var url = this.options.url;
    this.selected = [];
    xhr(url, {mpp: this.options.maxPerPage, q: this.options.query, p: this.options.currentPage, sort_column: this.sortColumn, sort_order: this.sortOrder}, function (content) {
      if (typeof content !== 'object' || !('rows' in content)) {
        alert('Error');
        return;
      }
      //var content = {"page":1,"total":149,"rows":[["515","<img src=\"content\/recept\/apelsin-soyaglacerade-tunna-revbensspjall.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",515,"Apelsin & soyaglacerade tunna revbensspj\u00e4ll",4,45,"<ol>\r\n<li>Dela revbensspj&auml;llen och l&auml;gg i stor kastrull. Fyll p&aring; med kallt vatten, &ouml;l och gr&ouml;nsaksfond, koka upp och l&aring;t koka p&aring; l&aring;g v&auml;rme under lock i ca 2-3 tim, tills k&ouml;ttet &auml;r m&ouml;rt. L&aring;t svalna.<\/li>\r\n<li>S&auml;tt ugnen p&aring; 225&deg;.<\/li>\r\n<li>Rosta kryddorna i en torr stekpanna och st&ouml;t dem d&auml;refter i en mortel.<\/li>\r\n<li>Skala och riv ingef&auml;ra.<\/li>\r\n<li>Blanda med &ouml;vriga ingredienser till marinaden och de rostade kryddorna.<\/li>\r\n<li>Smaka av med salt och peppar, l&aring;t st&aring;.<\/li>\r\n<li>Torka spj&auml;llen p&aring; hush&aring;llspapper och l&auml;gg p&aring; pl&aring;t med bakpl&aring;tspapper.<\/li>\r\n<li>Pensla p&aring; marinaden och glacera i ugnen tills de f&aring;tt fin f&auml;rg p&aring; b&aring;da sidorna. Forts&auml;tt pensla under tiden tills det &auml;r dags f&ouml;r servering.<\/li>\r\n<li>OBS! L&aring;t spj&auml;llen bara sjuda, inte koka, f&ouml;r d&aring; kokar dem inte s&ouml;nder utan blir mjuka och sl&auml;pper fint fr&aring;n benen.<\/li>\r\n<\/ol>","13","0"],["517","<img src=\"content\/recept\/apelsindressing.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",517,"Apelsindressing",4,15,"<ol>\r\n<li>Vispa samman senap &auml;ggula och honung.<\/li>\r\n<li>Vispa ner oljan i en tunn str&aring;le till en kr&auml;mig s&aring;s.<\/li>\r\n<\/ol>","6","0"],["518","<img src=\"content\/recept\/awasizu-dressing.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",518,"Awasizu dressing",4,"-","<ol>\r\n<li>Blanda alla ingredienser.<\/li>\r\n<\/ol>","6","0"],["522","<img src=\"content\/recept\/baconstekt-oxfile-med-appelmustsas-rostad-rotselleri-och-haricots-verts.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",522,"Baconstekt oxfil\u00e9 med \u00e4ppelmusts\u00e5s, rostad rotselleri och haricots verts",4,"-","<ol>\r\n<li>S&auml;tt ugnen p&aring; 100&deg;. Skala rotsellerin och sk&auml;r i 5 cm klyftor &ndash; en klyfta\/portion.<\/li>\r\n<li>Klicka en sm&ouml;rklick samt en skv&auml;tt Bong Touch of Taste kalvfond p&aring; varje klyfta och baka i ugn, tills de &auml;r mjuka.<\/li>\r\n<li>Putsa bort hinnan p&aring; oxfil&eacute;n och bryn den i sm&ouml;r i panna s&aring; den f&aring;r fin f&auml;rg. L&auml;gg ut baconskivorna p&aring; en pl&aring;t och placera oxfil&eacute;n &ouml;ver.<\/li>\r\n<li>Str&ouml; rikligt med rosmarin &ouml;ver och linda baconet runt oxfil&eacute;n.<\/li>\r\n<li>L&aring;t oxfil&eacute;n stekas i ugn, med sellerin, till en innertemp p&aring; 58&deg;.<\/li>\r\n<li>Ta ut ur ugnen och l&aring;t vila, minst 20 min i folie.<\/li>\r\n<li>Koka upp vispgr&auml;dde, Bong Touch of Taste kalvfond och &auml;ppelmust. L&aring;t koka ihop. Smaka av med &auml;ppelcidervin&auml;ger och nymalen vitpeppar.<\/li>\r\n<li>Koka haricots verts i saltat vatten, sl&aring; av vattnet och l&auml;gg i en klick sm&ouml;r. Skala och t&auml;rna &auml;pplet i sm&aring; t&auml;rningar och tills&auml;tt i s&aring;sen strax innan servering.<\/li>\r\n<li>Skiva oxfil&eacute;n och servera med sellerin, haricots verts och &auml;ppelmusts&aring;sen.<\/li>\r\n<\/ol>","16","0"],["525","<img src=\"content\/recept\/bbq-glaze.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",525,"BBQ- glaze",4,"-","<ol>\r\n<li>Blanda alla ingredienser i en sk&aring;l, vispa ihop till en sl&auml;t glaze.<\/li>\r\n<li>Pensla p&aring; glazen under tiden ni steker eller grillar ert k&ouml;tt er fisk, era gr&ouml;nsaker eller kyckling. G&auml;rna tre g&aring;nger\/r&aring;vara.<\/li>\r\n<li>T&auml;nk p&aring; att inte grilla &ouml;ver f&ouml;r h&ouml;g v&auml;rme.<\/li>\r\n<\/ol>","7","0"],["526","<img src=\"content\/recept\/bbq-sas.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",526,"BBQ s\u00e5s",4,"-","<ol>\r\n<li>Skala och finhacka r&ouml;dl&ouml;ken och vitl&ouml;ksklyftorna.<\/li>\r\n<li>K&auml;rna ur chilin och finhacka.<\/li>\r\n<li>L&auml;gg allt i en kastrull tillsammans med &ouml;vriga ingredienser.<\/li>\r\n<li>Koka upp och l&aring;t puttra i 20 min, st&auml;ll &aring;t sidan och l&aring;t svalna.<\/li>\r\n<li>H&auml;ll upp p&aring; rena flaskor och f&ouml;rvara i kylen.<\/li>\r\n<li>Barbecues&aring;sen h&aring;ller i minst 2 veckor.<\/li>\r\n<\/ol>","12","0"],["528","<img src=\"content\/recept\/bbq-glacerad-flaskkarre-och-ortsmaksatt-farskost.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",528,"BBQ-glacerad fl\u00e4skkarr\u00e9 och \u00f6rtsmaksatt f\u00e4rskost",4,"-","<ol>\r\n<li>Blanda alla ingredienser i en sk&aring;l, vispa ihop till en sl&auml;t glaze.<\/li>\r\n<li>Pensla p&aring; glazen under tiden ni steker eller grillar ert k&ouml;tt. G&auml;rna 2-3 g&aring;nger under stek\/grilltiden.<\/li>\r\n<li>T&auml;nk p&aring; att inte grilla &ouml;ver f&ouml;r h&ouml;g v&auml;rme.<\/li>\r\n<li>&Ouml;rtf&auml;rskost:<\/li>\r\n<li>Blanda f&auml;rskosten med de hackade &ouml;rterna, smaka av med Touch of taste Italy kalvfond &amp; svartpeppar.<\/li>\r\n<li>L&aring;t st&aring; i kyl till servering.<\/li>\r\n<\/ol>","17","0"],["529","<img src=\"content\/recept\/bearnaisesas.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",529,"Bearnaises\u00e5s",4,"-","<ol>\r\n<li>Blanda vin&auml;ger, schalottenl&ouml;ksfond samt vatten i en kastrull tillsammans med dragon, vitpepparkorn. Koka ihop, reducera, till ungef&auml;r h&auml;lften.<\/li>\r\n<li>Sm&auml;lt sm&ouml;ret p&aring; svag v&auml;rme i en kastrull.<\/li>\r\n<li>Dra bort kastrullen fr&aring;n v&auml;rmen, men h&aring;ll sm&ouml;ret varmt.<\/li>\r\n<li>Sila ner vin&auml;gerreduktionen i en ny kastrull.<\/li>\r\n<li>Vispa ner 3 &auml;ggulor. S&auml;tt kastrullen i ett vattenbad med sm&aring;kokande vatten. Vispa tills s&aring;sen tjocknar.<\/li>\r\n<li>Ta bort kastrullen ur vattenbadet och h&auml;ll sakta ner det sm&auml;lta sm&ouml;ret i en fin str&aring;le under vispning, undvik bottensatsen.<\/li>\r\n<li>Str&ouml; i hackad dragon och hackad persilja, smaka av med salt och cayennpeppar.<\/li>\r\n<\/ol>","10","6"],["530","<img src=\"content\/recept\/bibinba-med-marinerade-bongroddar.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",530,"Bibinba med marinerade b\u00f6ngroddar",4,"-","<ol>\r\n<li>Koka upp en liter l&auml;ttsaltat vatten och l&auml;gg i de f&auml;rska b&ouml;ngroddarna i ca.30 sekunder, spola dem sedan direkt i kallt vatten.<\/li>\r\n<li>Blanda ner i marinaden och v&auml;nd runt groddarna i blandningen, salta och peppra.<\/li>\r\n<li>Skala ingef&auml;ra och vitl&ouml;k och mixa dem tillsammans med &frac12; dl vatten till en pur&eacute;.<\/li>\r\n<li>Sk&auml;r gr&ouml;nsakerna och &auml;pplet i centermeterstora bitar.<\/li>\r\n<li>Blanda ihop resterande ingredienser till buljongen i en kastrull och l&aring;t det sjuda tillsammans med gr&ouml;nsakerna och &auml;pplet i ca 30 minuter, sila sedan buljongen.<\/li>\r\n<li>Red av buljongen med maizena mj&ouml;l och tills&auml;tt pur&eacute;n med ingef&auml;ra och vitl&ouml;k.<\/li>\r\n<li>Bryn fl&auml;skkarr&eacute;n p&aring; sidor hastigt p&aring; medelh&ouml;g v&auml;rme.<\/li>\r\n<li>L&auml;gg k&ouml;ttet i en kastrull och sl&aring; p&aring; s&aring;sen, l&aring;t det koka upp.<\/li>\r\n<li>Klart att servera tillsamman med b&ouml;ngroddarna och fint skurna socker&auml;rtor.<\/li>\r\n<\/ol>","28","0"],["533","<img src=\"content\/recept\/blomkalssoppa-med-vegetarisk-pizza.jpg\" style=\"max-width: 200px; height: 60px;\" \/>",533,"Blomk\u00e5lssoppa med vegetarisk pizza",4,"-","<ol>\r\n<li>Skala och finhacka l&ouml;k och vitl&ouml;k. Fr&auml;s den mjuk i olja.<\/li>\r\n<li>Bryt blomk&aring;len i buketter och tills&auml;tt tillsammans med mj&ouml;lk, fond och gr&auml;dde. Koka ca 30 min tills blomk&aring;len &auml;r mjuk. Mixa soppan sl&auml;t.<\/li>\r\n<li>Smaks&auml;tt med spiskummin, salt och peppar.<\/li>\r\n<li>Sp&auml;d eventuellt med mer vatten eller mj&ouml;lk.<\/li>\r\n<li>Garnera med olivolja, chiliflakes och bladpersilja.<\/li>\r\n<li>L&auml;gg den f&auml;rdigkavlade pizzadegen p&aring; en pl&aring;t.<\/li>\r\n<li>Skiva svamp och zucchini tunt p&aring; mandolin eller med en gr&ouml;nsakssk&auml;rare.<\/li>\r\n<li>Blanda f&auml;rskost och fond. Bred f&auml;rskosten p&aring; pizzan.<\/li>\r\n<li>L&auml;gg p&aring; gr&ouml;nsakerna och ringla &ouml;ver olivolja, ost och svartpeppar.<\/li>\r\n<li>Gr&auml;dda i 200&deg; i 15-20 min tills pizzan &auml;r gyllenbrun.<\/li>\r\n<li>Str&ouml; &ouml;ver &ouml;rter vid servering.<\/li>\r\n<\/ol>","21","0"]]};
      //var content = {"page":1,"total":0,"rows":[]};
      self.rows = content.rows.map(function (values) {
        var row = {}, ci = 0;
        for (var c in self.options.columns)
          row[c] = values[ci++];
        return row;
      });
      self.options.currentPage = content.page;
      self.options.numItems = content.total;
      self.template.populate();
    });
  };
  Grid.defaultOptions = {
    url: window.location.href,
    columns: {},
    actions: {},
    query: '',
    numItems: 0, // TODO: not an option...
    maxPerPage: 10,
    currentPage: 1,
    sortable: false,
    template: 'default',
    cancel: "input,textarea,button,select,option,a"
  };
  Grid.defaultColumnOptions = {
    label: '[id]',
    sortable: false,
    escape: true,
    action: null,
    hide: false,
    width: false,
    align: false
  };
  Grid.defaultActionOptions = {
    label: '[id]',
    general: false,
    single: false,
    multi: false,
    href: window.location.href,
    class: ''
  };
  Grid.templates = {};

  /////////////////////////////////////////

  function GridTemplate(grid) {
    this.grid = grid;
    this.init();
  }

  Grid.templates.default = GridTemplate;

  GridTemplate.prototype.init = function () {
    this.buildMain();
  };

  GridTemplate.prototype.buildMain = function () {
    this.grid.dom.innerHTML = '';
    this.grid.dom.classList.add('modelview');
    this.grid.dom.appendChild(this.header = this.buildHeader());
    this.grid.dom.appendChild(this.body = this.buildBody());
    this.grid.dom.appendChild(this.footer = this.buildFooter());
    this.populate();
  };

  GridTemplate.prototype.buildHeader = function () {
    var grid = this.grid,
        input = create('input', {type: "text", placeholder: "Search...", className: "modelview-search-field"}),
        search = create('span', {className: "modelview-search"}, [input]),
        header = create('div', {className: 'modelview-header'}, [
          create('strong', {textContent: this.grid.options.title, className: 'modelview-title'}),
          this.buildGeneralActions(),
          search
        ]);
    input.addEventListener('input', function () {
      //console.log('change');
      grid.options.query = this.value;
      grid.load();
    });
    this.search = search;
    return header;
  };

  GridTemplate.prototype.buildGeneralActions = function () {
    var actions = create('span', {className: "modelview-general-actions"});
    for (var i in this.grid.options.actions) {
      var a = this.grid.options.actions[i];
      if (a.general) {
        actions.appendChild(create('a', {
          href: a.href,
          className: "modelview-general-action " + a.class,
          textContent: a.label
        }));
      }
    }
    return actions;
  };

  GridTemplate.prototype.buildBody = function () {
    var self = this,
        grid = this.grid,
        actionList = create('ul'),
        maxPerPageInput = create('input', {type: 'number', value: grid.options.maxPerPage}),
        header = create('tr', {className: "modelview-header-row"}),
        thead = create('thead', [header]),
        tbody = create('tbody'),
        colgroup = create('colgroup'),
        table = create('table', {className: "modelview-content-table"}, [colgroup, thead, tbody]);
    for (var c in this.grid.options.columns) {
      var column = this.grid.options.columns[c],
          col = create('col'),
          th = create('th'),
          cb = create('input', {type: 'checkbox', checked: !column.hide}),
          label = create('label', [cb, document.createTextNode(' '+column.label)]);
      colgroup.appendChild(col);
      if (column.sortable) {
        var sortSymbol = (grid.sortColumn == c ? (grid.sortOrder === 'asc' ? '↓' : '↑') : '↕'),
            a = create('a', {textContent: column.label+sortSymbol, href: ''});
        a.addEventListener('click', (function (columnName) {
          return function (e) {
            grid.toggleSort(columnName);
            e.preventDefault();
            return false;
          }
        })(c));
        th.appendChild(a);
      } else {
        th.textContent = column.label;
      }
      if (column.hide) {
        col.style.display = 'none'; // fixes issue in webkit
        th.style.display = 'none';
      }
      if (column.align)
        th.style.textAlign = column.align;
      if (typeof column.width !== 'undefined')
        col.style.width = typeof column.width == "number" ? column.width + 'px' : column.width;
      header.appendChild(th);

      // toggle column
      cb.addEventListener('change', (function(column) {
        return function(e) {
          column.hide = !this.checked;
          self.buildMain();
        };
      })(column));
      actionList.appendChild(create('li', [label]));
    }
    colgroup.appendChild(create('col'));

    // max per page input
    maxPerPageInput.addEventListener('change', function (e) {
      grid.options.maxPerPage = this.value;
      grid.load();
      e.preventDefault();
      return false;
    });
    actionList.appendChild(create('li', [maxPerPageInput]));
    header.appendChild(create('th', {className: "modelview-col-actions", innerHTML: '▼'}, [actionList]));

    table.addEventListener('click', function (e) {
      var node = e.target;
      while (node && !node.classList.contains('modelview-row') && node.parentNode !== table) {
        if (matches(node, grid.options.cancel))
          return;
        node = node.parentNode;
      }
      if (node && node.classList.contains('modelview-row') && node.parentNode === tbody) {
        // found row!
        var rowIndex = node.modelviewRowIndex;
        var result = node.classList.toggle('modelview-row-selected');
        grid.select(rowIndex, result);
        e.preventDefault();
      }
    });

    this.tbody = tbody;
    this.content = create('div', {className: 'modelview-content'}, [table]);
    return this.content;
  };

  GridTemplate.prototype.buildFooter = function () {
    this.status = create('span', {className: 'modelview-status', textContent: 'Initializing...'});
    return create('div', {className: 'modelview-footer'}, [
      this.buildMultiActions(),
      this.status,
      this.buildPager()]);
  };

  GridTemplate.prototype.buildMultiActions = function () {
    var self = this,
        grid = this.grid,
        select = create('select'),
        button = create('button', {textContent: 'Go'}),
        actions = create('span', {
          className: "modelview-multi-actions",
          textContent: '↳ with selected '
        }, [select, button]);
    for (var i in grid.options.actions) {
      var a = grid.options.actions[i];
      if (a.multi) {
        select.appendChild(create('option', {value: i, textContent: a.label}));
      }
    }
    actions.style.display = 'none';

    grid.dom.addEventListener('change', function () {
      actions.style.display = grid.selected.length ? '' : 'none';
    });

    button.addEventListener('click', function() {
      var a = grid.options.actions[select.value],
          url = self.actionLink(a, grid.getSelected());
      window.location.href = url;
    });

    return actions;
  };

  GridTemplate.prototype.buildPager = function () {
    var grid = this.grid,
        input = create('input', {type: 'number', min: 1, max: 1});
    input.addEventListener('change', function () {
      grid.options.currentPage = this.value;
      grid.load();
    });
    this.pager = create('span', {className: 'modelview-pager'}, [input]);
    this.pager.appendChild(document.createTextNode(' '));
    this.pagerInput = input;
    return this.pager;
  };

  GridTemplate.prototype.buildCell = function (column, value, id) {
    var td = document.createElement('td');
    if (column.action) {
      var action = this.grid.options.actions[column.action];
      var a = document.createElement('a');
      a.href = this.actionLink(action, id);
      a.className = action.class;
      a[column.escape ? 'textContent' : 'innerHTML'] = value;
      td.appendChild(a);
    } else {
      td[column.escape ? 'textContent' : 'innerHTML'] = value;
    }
    return td;
  };

  GridTemplate.prototype.actionLink = function (action, id) {
    var uri = action.href;
    if (uri.indexOf('/:id/') !== -1 && !Array.isArray(id)) {
      return uri.replace('/:id/', '/'+encodeURIComponent(id)+'/');
    }
    uri += uri.indexOf('?') !== -1 ? '&' : '?';
    if (Array.isArray(id)) {
      for (var i = 0; i < id.length; ++i)
        uri += (i ? '&item[]=' : 'item[]=') + encodeURIComponent(id[i]);
    } else {
      uri += 'item=' + encodeURIComponent(id);
    }
    return uri;
  };

  GridTemplate.prototype.buildSingleActions = function (id) {
    var
        list = document.createElement('ul'),
        td = create('td', {className: 'modelview-col-actions'}, [
          create('div', {className: 'modelview-single-actions', innerHTML: '&hellip;'}, [list])
        ]),
        li;
    for (var i in this.grid.options.actions) {
      var action = this.grid.options.actions[i];
      if (action.single) {
        var a = create('a', {href: this.actionLink(action, id), className: action.class, textContent: action.label});
        li = create('li', {className: 'modelview-single-action'});
        li.appendChild(a);
        list.appendChild(li);
      }
    }
    return td;
  };

  GridTemplate.prototype.populate = function () {
    var rows = this.grid.rows,
    //height = $(this.content).clearQueue().css('height','').height(),
        tbody = this.tbody,
        tr, td, id, index;

    // Clear content
    tbody.innerHTML = '';

    // Build rows
    for (index = 0; index < rows.length; ++index) {
      id = rows[index][this.grid.options.idColumn];
      tr = create('tr', {className: 'modelview-row'});
      tr.modelviewRowIndex = index;
      for (var c in this.grid.options.columns) {
        var column = this.grid.options.columns[c];
        td = this.buildCell(column, rows[index][c], id);
        if (column.hide)
          td.style.display = 'none';
        if (column.align)
          td.style.textAlign = column.align;
        tr.appendChild(td);
      }
      tr.appendChild(this.buildSingleActions(id));
      tbody.appendChild(tr);
    }

    // No rows? Show no entries found.
    if (!rows.length) {
      tbody.appendChild(
          create('tr', {className: 'modelview-empty'}, [
            create('td', {textContent: 'No entries found'}, {colspan: Object.keys(this.grid.options.columns).length + 1})
          ])
      );
    }

    // Animate height
    //var postHeight = $(this.content).height();
    //$(this.content).height(height).animate({height: postHeight}, function() { $(this).css('height', ''); });

    this.updatePager();
  };

  GridTemplate.prototype.updatePager = function () {
    var numRows = this.grid.rows.length,
        page = this.grid.options.currentPage,
        total = this.grid.options.numItems,
        maxPerPage = this.grid.options.maxPerPage;

    if (!maxPerPage || total <= maxPerPage) {
      // Only one page
      this.status.textContent = 'Showing ' + numRows + ' items.';
      this.search.style.display = (this.grid.options.query !== '') ? '' : 'none';
      this.pager.style.display = 'none';
    } else {
      // Show pager
      var start = 1 + (page - 1) * maxPerPage,
          end = Math.min(total, page * maxPerPage),
          numPages = Math.ceil(total / maxPerPage);
      this.status.textContent = 'Showing ' + start + ' to ' + end + ' of ' + total + ' items.';
      this.pager.style.display = '';
      this.search.style.display = '';
      this.pager.lastChild.textContent = ' of ' + numPages;

      // Update input
      this.pagerInput.max = numPages;
      this.pagerInput.value = this.grid.options.currentPage;
      this.pagerInput.style.width = (numPages.toString().length + 1) + 'em';
    }
  };

  w.Grid = Grid;

  // Expose jQuery plugin, if jQuery is loaded
  if ('jQuery' in w) {
    var $ = w.jQuery;
    $.fn.modelview = function (options) {
      return this.each(function () {
        var $el = $(this);
        // Add a reverse reference to the DOM object
        if ($el.data('modelview-instance'))
          return;
        var dataOptions = $el.data('modelview');
        $el.data("modelview-instance", new Grid(this, $.extend({}, dataOptions, options)));
      });
    };
  }
})(window);