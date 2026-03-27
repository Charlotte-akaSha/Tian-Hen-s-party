/* global PROGRAM */

function el(id) {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node;
}

function mapsLink(query) {
  const url = new URL("https://www.google.com/maps/search/");
  url.searchParams.set("api", "1");
  url.searchParams.set("query", query);
  return url.toString();
}

function safeText(value) {
  return value == null ? "" : String(value);
}

/** Append text, turning http(s) URLs into links (safe: no raw HTML). */
function appendTextWithLinks(el, text) {
  const s = String(text);
  const urlRe = /https?:\/\/[^\s<]+/g;
  let last = 0;
  let m;
  let any = false;
  while ((m = urlRe.exec(s)) !== null) {
    any = true;
    let raw = m[0];
    let url = raw;
    while (/[.,;:!?)\]'"]$/.test(url) && url.length > 10) {
      url = url.slice(0, -1);
    }
    if (m.index > last) {
      el.appendChild(document.createTextNode(s.slice(last, m.index)));
    }
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = url;
    el.appendChild(a);
    last = m.index + raw.length;
  }
  if (!any) {
    el.appendChild(document.createTextNode(s));
  } else if (last < s.length) {
    el.appendChild(document.createTextNode(s.slice(last)));
  }
}

function notesLooksLikeTitle(line, next) {
  if (!next) return false;
  const t = line.trim();
  if (!t || t.length > 120) return false;
  if (/[.!?]$/.test(t)) return false;
  return next.length > t.length;
}

/** Next identity block in “The X” bar-crawl style; continuation lines stay in previous box. */
function notesIsNewIdentityHeading(line) {
  const t = (line || "").trim();
  if (!/^The\s+[A-Z]/.test(t)) return false;
  if (/[.!?]\s*$/.test(t)) return false;
  if (t.length > 90) return false;
  const words = t.split(/\s+/).length;
  return words >= 2 && words <= 10;
}

/**
 * Rich layout for Notes: paragraphs (blank line), bullet lines (- • * – or 1.),
 * title + body pairs when a short line is followed by a longer line.
 */
function renderNotesInto(container, text) {
  container.classList.add("notesRich");
  container.replaceChildren();
  const raw = (text ?? "").trim();
  if (!raw) return;

  const bulletRe = /^[-•*–]\s+|^\d+\.\s+/;
  const blocks = raw.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.split(/\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) continue;

    if (lines.length > 1 && lines.every((l) => bulletRe.test(l))) {
      const ul = document.createElement("ul");
      ul.className = "notesList";
      for (const line of lines) {
        const li = document.createElement("li");
        appendTextWithLinks(li, line.replace(bulletRe, "").trim());
        ul.appendChild(li);
      }
      container.appendChild(ul);
      continue;
    }

    if (lines.length === 1) {
      const p = document.createElement("p");
      p.className = "notesPara";
      appendTextWithLinks(p, lines[0]);
      container.appendChild(p);
      continue;
    }

    const stack = document.createElement("div");
    stack.className = "notesStack";
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      const next = lines[i + 1];
      if (notesLooksLikeTitle(line, next)) {
        const item = document.createElement("div");
        item.className = "notesItem";
        const t = document.createElement("div");
        t.className = "notesItem__title";
        appendTextWithLinks(t, line);
        const b = document.createElement("div");
        b.className = "notesItem__body";
        const p0 = document.createElement("p");
        p0.className = "notesItem__bodyPara";
        appendTextWithLinks(p0, next);
        b.appendChild(p0);
        let k = i + 2;
        while (k < lines.length) {
          const cont = lines[k];
          if (notesIsNewIdentityHeading(cont)) break;
          const p = document.createElement("p");
          p.className = "notesItem__bodyPara";
          appendTextWithLinks(p, cont);
          b.appendChild(p);
          k++;
        }
        item.append(t, b);
        stack.appendChild(item);
        i = k;
      } else {
        const p = document.createElement("p");
        p.className = "notesPara";
        appendTextWithLinks(p, line);
        stack.appendChild(p);
        i += 1;
      }
    }
    container.appendChild(stack);
  }
}

function setText(id, value) {
  el(id).textContent = safeText(value);
}

function renderQuickFacts(items) {
  const root = el("quickFacts");
  root.innerHTML = "";
  for (const item of items || []) {
    const row = document.createElement("div");
    row.className = "kv__row";

    const k = document.createElement("div");
    k.className = "kv__k";
    k.textContent = item.label;

    const v = document.createElement("div");
    v.className = "kv__v";
    v.textContent = item.value;

    row.append(k, v);
    root.append(row);
  }
}

function renderContacts(contacts) {
  const root = el("contacts");
  root.innerHTML = "";
  const card = document.getElementById("contactsCard");
  if (card) {
    const list = contacts || [];
    card.hidden = list.length === 0;
  }
  for (const c of contacts || []) {
    const item = document.createElement("div");
    item.className = "contact";

    const left = document.createElement("div");
    const name = document.createElement("div");
    name.className = "contact__name";
    name.textContent = c.name;
    const meta = document.createElement("div");
    meta.className = "contact__meta";
    meta.textContent = c.meta || "";
    left.append(name, meta);

    const actions = document.createElement("div");
    actions.className = "contact__actions";
    if (c.phone) {
      const a = document.createElement("a");
      a.href = `tel:${c.phone.replace(/\s+/g, "")}`;
      a.textContent = "Call";
      actions.append(a);
    } else if (c.link) {
      const a = document.createElement("a");
      a.href = c.link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open";
      actions.append(a);
    }

    item.append(left, actions);
    root.append(item);
  }
}

function renderPacking(items) {
  const root = el("packingList");
  root.innerHTML = "";
  for (const it of items || []) {
    const li = document.createElement("li");
    li.textContent = it;
    root.append(li);
  }
}

function renderPlanB(planB) {
  const intro = document.getElementById("planBIntro");
  const tableRoot = document.getElementById("planBTable");
  if (!intro || !tableRoot) return;

  if (!planB || !planB.rows || !planB.rows.length) {
    renderNotesInto(intro, "");
    intro.hidden = true;
    tableRoot.innerHTML = "";
    return;
  }

  const introText = (planB.intro || "").trim();
  renderNotesInto(intro, introText);
  intro.hidden = !introText;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  for (const label of [
    "Time",
    "Activity",
    "Place",
    "Google Maps link",
    "Notes",
  ]) {
    const th = document.createElement("th");
    th.textContent = label;
    trh.append(th);
  }
  thead.append(trh);

  const tbody = document.createElement("tbody");
  for (const row of planB.rows) {
    const tr = document.createElement("tr");
    const tdTime = document.createElement("td");
    tdTime.textContent = row.time || "—";
    const tdAct = document.createElement("td");
    tdAct.textContent = row.activity || "—";
    const tdPlace = document.createElement("td");
    tdPlace.className = "cellPlace";
    tdPlace.textContent = row.place || "—";
    const tdMap = document.createElement("td");
    tdMap.className = "map";
    if (row.mapUrl) {
      const a = document.createElement("a");
      a.href = row.mapUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open in Google Maps";
      tdMap.append(a);
    } else {
      tdMap.textContent = "—";
    }
    const tdNotes = document.createElement("td");
    tdNotes.className = "cellNotes";
    renderNotesInto(tdNotes, row.notes || "");
    tr.append(tdTime, tdAct, tdPlace, tdMap, tdNotes);
    tbody.append(tr);
  }
  table.append(thead, tbody);
  tableRoot.innerHTML = "";
  tableRoot.append(table);
}

function renderOtherActivities(oa) {
  const titleEl = document.getElementById("otherActivitiesTitle");
  const root = document.getElementById("otherActivities");
  if (!root) return;

  root.innerHTML = "";
  if (titleEl && oa && oa.title) {
    titleEl.textContent = oa.title;
  }

  if (!oa || !oa.rows || !oa.rows.length) return;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const trh = document.createElement("tr");
  for (const label of [
    "Activity",
    "Place",
    "Google Maps link",
    "Notes",
  ]) {
    const th = document.createElement("th");
    th.textContent = label;
    trh.append(th);
  }
  thead.append(trh);

  const tbody = document.createElement("tbody");
  for (const row of oa.rows) {
    const tr = document.createElement("tr");

    const tdAct = document.createElement("td");
    tdAct.textContent = row.activity || "—";

    const tdPlace = document.createElement("td");
    tdPlace.className = "cellPlace";
    tdPlace.textContent = row.place || "—";

    const tdMap = document.createElement("td");
    tdMap.className = "map";
    if (row.mapUrl) {
      const a = document.createElement("a");
      a.href = row.mapUrl;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open in Google Maps";
      tdMap.append(a);
    } else {
      tdMap.textContent = "—";
    }

    const tdNotes = document.createElement("td");
    tdNotes.className = "cellNotes";
    renderNotesInto(tdNotes, row.notes || "");

    tr.append(tdAct, tdPlace, tdMap, tdNotes);
    tbody.append(tr);
  }

  table.append(thead, tbody);
  root.append(table);
}

function dayHeadingTitle(day) {
  const dl = (day.dateLabel || "").trim();
  const city = (day.city || "").trim();
  if (!city) return dl;
  // ODS rows often set dateLabel to "Fri Apr 3 — Madeira (Tian leaves)" and city to the same tail — avoid "… — X — X"
  if (city && dl.includes(city)) return dl;
  return `${dl} — ${city}`;
}

function dayHeadingTagline(day) {
  const dl = (day.dateLabel || "").trim();
  const th = (day.theme || "").trim();
  const city = (day.city || "").trim();
  if (!th) return "";
  if (th === city && dl.includes(th)) return "";
  if (dl.includes(th)) return "";
  return th;
}

function renderDays(days) {
  const root = el("days");
  root.innerHTML = "";

  for (const day of days || []) {
    const wrap = document.createElement("article");
    wrap.className = "day";

    const head = document.createElement("div");
    head.className = "day__head";

    const left = document.createElement("div");
    const title = document.createElement("h3");
    title.className = "day__title";
    title.textContent = dayHeadingTitle(day);
    const tagline = document.createElement("div");
    tagline.className = "day__tagline";
    const tl = dayHeadingTagline(day);
    tagline.textContent = tl;
    tagline.hidden = !tl;
    left.append(title, tagline);

    const right = document.createElement("div");
    right.className = "muted small day__headNotes";
    renderNotesInto(right, day.notes || "");
    right.hidden = !(day.notes || "").trim();

    head.append(left, right);

    const tableWrap = document.createElement("div");
    tableWrap.className = "tableWrap";

    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const trh = document.createElement("tr");
    for (const label of [
      "Time",
      "Activity",
      "Place",
      "Google Maps link",
      "Notes",
    ]) {
      const th = document.createElement("th");
      th.textContent = label;
      trh.append(th);
    }
    thead.append(trh);

    const tbody = document.createElement("tbody");
    for (const row of day.rows || []) {
      const tr = document.createElement("tr");

      const tdTime = document.createElement("td");
      tdTime.textContent = row.time;

      const tdAct = document.createElement("td");
      tdAct.textContent = row.activity;

      const tdPlace = document.createElement("td");
      tdPlace.className = "cellPlace";
      tdPlace.innerHTML = "";
      const placeTitle = document.createElement("div");
      placeTitle.textContent = row.placeName;
      const placeCity = document.createElement("small");
      placeCity.textContent = row.placeCity;
      tdPlace.append(placeTitle, placeCity);

      const tdMap = document.createElement("td");
      tdMap.className = "map";
      const a = document.createElement("a");
      a.href = row.mapUrl || mapsLink(`${row.placeName}, ${row.placeCity}`);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = "Open in Google Maps";
      tdMap.append(a);

      const tdNotes = document.createElement("td");
      tdNotes.className = "cellNotes";
      renderNotesInto(tdNotes, row.notes || "");

      tr.append(tdTime, tdAct, tdPlace, tdMap, tdNotes);
      tbody.append(tr);
    }

    table.append(thead, tbody);
    tableWrap.append(table);

    wrap.append(head, tableWrap);
    root.append(wrap);
  }
}

function wireButtons(program) {
  el("printBtn").addEventListener("click", () => window.print());

  el("copyLinkBtn").addEventListener("click", async () => {
    const lines = [
      `${program.title} — ${program.dates} — ${program.location}`,
      "",
      `Open: ${window.location.href}`,
      "",
      "Tip: tap any Maps link in the schedule.",
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    el("copyLinkBtn").textContent = "Copied";
    window.setTimeout(() => {
      el("copyLinkBtn").textContent = "Copy share text";
    }, 1400);
  });
}

function main() {
  const program = window.PROGRAM;
  if (!program) throw new Error("Missing PROGRAM in content/program-data.js");

  document.title = program.title || document.title;

  setText("kicker", program.kicker || "Hens weekend");
  setText("title", program.navTitle || "Program");
  setText("datesPill", program.dates || "Dates TBC");
  setText("locationPill", program.location || "Location TBC");
  setText("heroTitle", program.heroTitle || program.title || "Hens Program");
  const sub = el("subtitle");
  const subText = (program.subtitle || "").trim();
  sub.textContent = subText;
  sub.hidden = !subText;
  const schedSub = el("scheduleSubtitle");
  const schedText = (program.scheduleSubtitle || "").trim();
  schedSub.textContent = schedText;
  schedSub.hidden = !schedText;
  const footText = (program.footerNote || "").trim();
  setText("footerNote", footText);
  const siteFooter = document.getElementById("siteFooter");
  if (siteFooter) siteFooter.hidden = !footText;

  renderQuickFacts(program.quickFacts || []);
  renderContacts(program.contacts || []);
  renderPacking(program.packingList || []);
  renderPlanB(program.planB || null);
  renderOtherActivities(program.otherActivities || null);
  renderDays(program.days || []);
  wireButtons(program);
}

main();
