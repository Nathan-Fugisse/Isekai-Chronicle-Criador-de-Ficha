(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const ATTRS = [
    {key:"for", name:"Força", short:"FOR", desc:"Potência física"},
    {key:"des", name:"Destreza", short:"DES", desc:"Agilidade e precisão"},
    {key:"con", name:"Constituição", short:"CON", desc:"Resistência física"},
    {key:"int", name:"Inteligência", short:"INT", desc:"Raciocínio e conhecimento"},
    {key:"sab", name:"Sabedoria", short:"SAB", desc:"Percepção e sensibilidade"},
    {key:"car", name:"Carisma", short:"CAR", desc:"Presença e influência"}
  ];
  const SKILLS = ["Acrobacia","Adestramento","Atletismo","Atuação","Cavalgar","Conhecimento","Medicina","Diplomacia","Enganação","Fortitude","Furtividade","Intimidação","Intuição","Investigação","Ladinagem","Luta","Percepção","Persuasão","Pontaria","Sobrevivência"];
  const STORAGE_KEY = "isekaiChronicleCharacters_v1";
  let character = freshCharacter();
  let toastTimer;

  function freshCharacter(){
    const attributes = {};
    ATTRS.forEach(a => attributes[a.key] = {base:8, bonus:0});
    return {
      id: makeId(), name:"", race:"Humano", level:1, occupation:"", background:"", concept:"",
      attributes, resources:{pvCurrent:0,pvMax:0,pmCurrent:0,pmMax:0,peCurrent:0,peMax:0,postureCurrent:0,postureMax:0,ep:10,movement:"",initiative:"",bonuses:""},
      naturalities:[], manaMagic:false, titles:[], abilities:[], skills:[], spells:[], items:[],
      personality:"", goals:"", notes:""
    };
  }
  function makeId(){return Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
  function modifier(score){return Math.floor((Number(score)-11)/2)}
  function signed(n){return n>0?`+${n}`:String(n)}
  function totalAttr(key){const a=character.attributes[key];return Number(a.base||0)+Number(a.bonus||0)}
  function spentPoints(){return ATTRS.reduce((s,a)=>s+Math.max(0,Number(character.attributes[a.key].base)-8),0)}
  function remainingPoints(){return 15-spentPoints()}
  function showToast(message){const t=$("toast");t.textContent=message;t.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove("show"),2300)}
  function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

  function renderAttributes(){
    $("attribute-grid").innerHTML=ATTRS.map(a=>{
      const val=totalAttr(a.key), base=Number(character.attributes[a.key].base), bonus=Number(character.attributes[a.key].bonus);
      return `<div class="attribute-card">
        <div class="attr-name"><div class="attr-icon">${a.short}</div><div><strong>${a.name}</strong><small>${a.desc}</small></div></div>
        <div class="attr-controls"><button type="button" data-attr="${a.key}" data-delta="-1" aria-label="Diminuir ${a.name}">−</button><input aria-label="${a.name} base" type="number" min="8" max="1000" data-base="${a.key}" value="${base}"><button type="button" data-attr="${a.key}" data-delta="1" aria-label="Aumentar ${a.name}">＋</button></div>
        <div class="attr-footer"><span>Bônus adicional <input style="width:54px;padding:4px 5px;margin-left:4px;text-align:center" type="number" data-bonus="${a.key}" value="${bonus}" aria-label="Bônus adicional de ${a.name}"></span><strong>${signed(modifier(val))} MOD</strong></div>
      </div>`;
    }).join("");
    $("points-left").textContent=remainingPoints();
    $("points-left").style.color=remainingPoints()<0?"#ff777f":"";
  }
  function updateLevel(){
    let lvl=Math.max(1,Math.min(100,Number($("level").value)||1));
    $("level").value=lvl;$("level-range").value=lvl;$("hero-level").textContent=lvl;character.level=lvl;
  }
  function bindTextFields(){
    const mapping={name:"name",race:"race",level:"level",occupation:"occupation",background:"background",concept:"concept",
      "pv-current":"resources.pvCurrent","pv-max":"resources.pvMax","pm-current":"resources.pmCurrent","pm-max":"resources.pmMax",
      "pe-current":"resources.peCurrent","pe-max":"resources.peMax","posture-current":"resources.postureCurrent","posture-max":"resources.postureMax",
      ep:"resources.ep",movement:"resources.movement",initiative:"resources.initiative",bonuses:"resources.bonuses",
      personality:"personality",goals:"goals",notes:"notes"};
    Object.entries(mapping).forEach(([id,path])=>{
      const el=$(id); if(!el)return;
      const parts=path.split(".");
      const value=parts.length===1?character[parts[0]]:character[parts[0]][parts[1]];
      if(value!==undefined && value!==null)el.value=value;
      el.addEventListener("input",()=>{
        const v=el.type==="number"?(el.value===""?0:Number(el.value)):el.value;
        if(parts.length===1)character[parts[0]]=v;else character[parts[0]][parts[1]]=v;
        if(id==="level"){updateLevel();renderAttributes()}
      });
    });
    $("level-range").addEventListener("input",()=>{$("level").value=$("level-range").value;updateLevel()});
    $("race").addEventListener("change",()=>character.race=$("race").value);
    $("mana-magic").checked=character.manaMagic;
    $("mana-magic").addEventListener("change",()=>character.manaMagic=$("mana-magic").checked);
  }
  function renderTitles(){
    $("titles-list").innerHTML=character.titles.map((t,i)=>`<div class="repeat-row"><input data-title-name="${i}" value="${escapeHtml(t.name)}" placeholder="Nome do título"><select data-title-equipped="${i}" aria-label="Equipar título"><option value="false" ${!t.equipped?"selected":""}>Armazenado</option><option value="true" ${t.equipped?"selected":""}>Equipado</option></select><button class="remove-row" data-remove-title="${i}" aria-label="Remover título">×</button></div>`).join("");
  }
  function renderAbilities(){
    $("abilities-list").innerHTML=character.abilities.map((a,i)=>`<div class="repeat-row"><input data-ability-name="${i}" value="${escapeHtml(a.name)}" placeholder="Nome da habilidade"><input data-ability-desc="${i}" value="${escapeHtml(a.description)}" placeholder="Descrição / nível"><button class="remove-row" data-remove-ability="${i}" aria-label="Remover habilidade">×</button></div>`).join("")||`<div class="muted">Nenhuma habilidade registrada.</div>`;
  }
  function renderSkills(){
    $("skills-list").innerHTML=SKILLS.map(s=>`<label><input type="checkbox" data-skill="${escapeHtml(s)}" ${character.skills.includes(s)?"checked":""}>${escapeHtml(s)}</label>`).join("");
  }
  function renderSpells(){
    const body=$("spells-table"), panel=body.closest(".table-panel");
    body.innerHTML=character.spells.map((s,i)=>`<tr><td><strong>${escapeHtml(s.name)}</strong><br><span class="muted">${escapeHtml(s.description||"")}</span></td><td>${escapeHtml(s.nature)}</td><td>${escapeHtml(s.tier)}</td><td>${s.pac}</td><td>${Math.max(1,Math.ceil(Number(s.pac)/2))}</td><td><button class="table-action" data-edit-spell="${i}" title="Editar">✎</button> <button class="table-action" data-remove-spell="${i}" title="Remover">×</button></td></tr>`).join("");
    panel.classList.toggle("is-empty",character.spells.length===0);
  }
  function renderItems(){
    const body=$("items-table"), panel=body.closest(".table-panel");
    body.innerHTML=character.items.map((it,i)=>`<tr><td><strong>${escapeHtml(it.name)}</strong></td><td>${escapeHtml(it.category)}</td><td>${escapeHtml(it.quality)}</td><td>${escapeHtml(it.bonus||"—")}</td><td><button class="table-action" data-edit-item="${i}" title="Editar">✎</button> <button class="table-action" data-remove-item="${i}" title="Remover">×</button></td></tr>`).join("");
    panel.classList.toggle("is-empty",character.items.length===0);
  }
  function renderAll(){
    $("name").value=character.name||"";$("race").value=character.race||"Humano";$("level").value=character.level||1;
    $("occupation").value=character.occupation||"";$("background").value=character.background||"";$("concept").value=character.concept||"";
    $("pv-current").value=character.resources.pvCurrent??0;$("pv-max").value=character.resources.pvMax??0;
    $("pm-current").value=character.resources.pmCurrent??0;$("pm-max").value=character.resources.pmMax??0;
    $("pe-current").value=character.resources.peCurrent??0;$("pe-max").value=character.resources.peMax??0;
    $("posture-current").value=character.resources.postureCurrent??0;$("posture-max").value=character.resources.postureMax??0;
    $("ep").value=character.resources.ep??10;$("movement").value=character.resources.movement||"";$("initiative").value=character.resources.initiative||"";$("bonuses").value=character.resources.bonuses||"";
    $("personality").value=character.personality||"";$("goals").value=character.goals||"";$("notes").value=character.notes||"";
    $("mana-magic").checked=!!character.manaMagic;
    document.querySelectorAll("#naturalities input").forEach(el=>el.checked=(character.naturalities||[]).includes(el.value));
    renderAttributes();updateLevel();renderTitles();renderAbilities();renderSkills();renderSpells();renderItems();
  }
  function collectFields(){
    character.name=$("name").value;character.race=$("race").value;character.level=Number($("level").value)||1;
    character.occupation=$("occupation").value;character.background=$("background").value;character.concept=$("concept").value;
    character.resources={pvCurrent:Number($("pv-current").value)||0,pvMax:Number($("pv-max").value)||0,pmCurrent:Number($("pm-current").value)||0,pmMax:Number($("pm-max").value)||0,peCurrent:Number($("pe-current").value)||0,peMax:Number($("pe-max").value)||0,postureCurrent:Number($("posture-current").value)||0,postureMax:Number($("posture-max").value)||0,ep:Number($("ep").value)||0,movement:$("movement").value,initiative:$("initiative").value,bonuses:$("bonuses").value};
    character.personality=$("personality").value;character.goals=$("goals").value;character.notes=$("notes").value;
    character.naturalities=[...document.querySelectorAll("#naturalities input:checked")].map(el=>el.value);
    character.manaMagic=$("mana-magic").checked;
  }
  function getSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]")}catch{return []}}
  function saveCurrent(){
    collectFields();
    if(!character.name.trim()){showToast("Dê um nome ao personagem antes de salvar.");$("name").focus();return}
    const list=getSaved();const idx=list.findIndex(c=>c.id===character.id);
    const copy=JSON.parse(JSON.stringify(character));
    if(idx>=0)list[idx]=copy;else list.unshift(copy);
    localStorage.setItem(STORAGE_KEY,JSON.stringify(list));showToast("Ficha salva neste navegador.");renderLibrary();
  }
  function renderLibrary(){
    const list=getSaved();$("library-empty").style.display=list.length?"none":"block";
    $("library-list").innerHTML=list.map(c=>`<article class="character-tile"><h3>${escapeHtml(c.name||"Personagem sem nome")}</h3><p>${escapeHtml(c.race||"Raça não definida")} · Nível ${Number(c.level)||1}${c.occupation?" · "+escapeHtml(c.occupation):""}</p><div class="tile-actions"><button class="btn btn-primary btn-small" data-load="${escapeHtml(c.id)}">Abrir ficha</button><button class="btn btn-outline btn-small" data-export="${escapeHtml(c.id)}">Exportar</button><button class="btn btn-quiet btn-small" data-delete="${escapeHtml(c.id)}">Excluir</button></div></article>`).join("");
  }
  function exportJson(c=character){
    collectFields();const blob=new Blob([JSON.stringify(c,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`isekai-ficha-${(c.name||"personagem").toLowerCase().replace(/[^a-z0-9]+/g,"-")}.json`;a.click();URL.revokeObjectURL(url);showToast("Arquivo JSON exportado.");
  }
  function newCharacter(){
    if(!confirm("Criar uma ficha nova? Salve a ficha atual antes para não perder alterações."))return;
    character=freshCharacter();renderAll();showView("character");showToast("Nova ficha criada.");
  }
  function showView(view){
    document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
    $("view-"+view).classList.add("active");
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
    $("page-title").textContent=({character:"Minha ficha",library:"Personagens salvos",guide:"Guia do sistema"})[view]||"Minha ficha";
    if(view==="library")renderLibrary();
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function openSpell(index=-1){
    const s=index>=0?character.spells[index]:{id:"",name:"",nature:"Magia de Mana",tier:"Tier 1",pac:1,description:""};
    $("spell-id").value=index>=0?String(index):"";$("spell-name").value=s.name;$("spell-nature").value=s.nature;$("spell-tier").value=s.tier;$("spell-pac").value=s.pac;$("spell-pm").value=Math.max(1,Math.ceil(Number(s.pac)/2));$("spell-description").value=s.description||"";
    $("spell-dialog-title").textContent=index>=0?"Editar magia":"Adicionar magia";$("spell-dialog").showModal();
  }
  function openItem(index=-1){
    const it=index>=0?character.items[index]:{name:"",category:"Arma",quality:"Comum",bonus:""};
    $("item-id").value=index>=0?String(index):"";$("item-name").value=it.name;$("item-category").value=it.category;$("item-quality").value=it.quality;$("item-bonus").value=it.bonus||"";
    $("item-dialog-title").textContent=index>=0?"Editar item":"Adicionar item";$("item-dialog").showModal();
  }

  $("attribute-grid").addEventListener("click",e=>{
    const b=e.target.closest("[data-attr]");if(!b)return;
    const key=b.dataset.attr,delta=Number(b.dataset.delta),a=character.attributes[key];
    if(delta>0 && remainingPoints()<=0){showToast("Você já distribuiu os 15 pontos iniciais.");return}
    if(delta<0 && Number(a.base)<=8){showToast("O valor base não pode ser menor que 8.");return}
    a.base=Number(a.base)+delta;renderAttributes();
  });
  $("attribute-grid").addEventListener("change",e=>{
    const base=e.target.closest("[data-base]"),bonus=e.target.closest("[data-bonus]");
    if(base){const old=Number(character.attributes[base.dataset.base].base),val=Math.max(8,Number(base.value)||8),delta=val-old;if(delta>remainingPoints()){showToast("Essa alteração ultrapassa os 15 pontos livres.");character.attributes[base.dataset.base].base=old}else character.attributes[base.dataset.base].base=val;renderAttributes()}
    if(bonus){character.attributes[bonus.dataset.bonus].bonus=Number(bonus.value)||0;renderAttributes()}
  });
  $("titles-list").addEventListener("input",e=>{const el=e.target.closest("[data-title-name]");if(el)character.titles[Number(el.dataset.titleName)].name=el.value});
  $("titles-list").addEventListener("change",e=>{
    const el=e.target.closest("[data-title-equipped]");if(!el)return;
    const idx=Number(el.dataset.titleEquipped),equip=el.value==="true";
    if(equip){character.titles.forEach(t=>t.equipped=false);character.titles[idx].equipped=true}
    else character.titles[idx].equipped=false;
    renderTitles();
  });
  $("titles-list").addEventListener("click",e=>{const b=e.target.closest("[data-remove-title]");if(b){character.titles.splice(Number(b.dataset.removeTitle),1);renderTitles()}});
  $("abilities-list").addEventListener("input",e=>{
    const n=e.target.closest("[data-ability-name]"),d=e.target.closest("[data-ability-desc]");
    if(n)character.abilities[Number(n.dataset.abilityName)].name=n.value;
    if(d)character.abilities[Number(d.dataset.abilityDesc)].description=d.value;
  });
  $("abilities-list").addEventListener("click",e=>{const b=e.target.closest("[data-remove-ability]");if(b){character.abilities.splice(Number(b.dataset.removeAbility),1);renderAbilities()}});
  $("skills-list").addEventListener("change",e=>{const el=e.target.closest("[data-skill]");if(!el)return;character.skills=el.checked?[...new Set([...character.skills,el.dataset.skill])]:character.skills.filter(s=>s!==el.dataset.skill)});
  $("spells-table").addEventListener("click",e=>{
    const edit=e.target.closest("[data-edit-spell]"),del=e.target.closest("[data-remove-spell]");
    if(edit)openSpell(Number(edit.dataset.editSpell));
    if(del&&confirm("Remover esta magia?")){character.spells.splice(Number(del.dataset.removeSpell),1);renderSpells()}
  });
  $("items-table").addEventListener("click",e=>{
    const edit=e.target.closest("[data-edit-item]"),del=e.target.closest("[data-remove-item]");
    if(edit)openItem(Number(edit.dataset.editItem));
    if(del&&confirm("Remover este item?")){character.items.splice(Number(del.dataset.removeItem),1);renderItems()}
  });
  $("spell-pac").addEventListener("input",()=>{$("spell-pm").value=Math.max(1,Math.ceil((Number($("spell-pac").value)||0)/2))});
  $("spell-form").addEventListener("submit",e=>{
    e.preventDefault();const idx=$("spell-id").value;
    const s={id:idx!==""?character.spells[Number(idx)].id:makeId(),name:$("spell-name").value.trim(),nature:$("spell-nature").value,tier:$("spell-tier").value,pac:Math.max(0,Number($("spell-pac").value)||0),description:$("spell-description").value};
    if(!s.name){showToast("Informe o nome da magia.");return}
    if(idx!=="")character.spells[Number(idx)]=s;else character.spells.push(s);
    $("spell-dialog").close();renderSpells();showToast("Magia registrada.");
  });
  $("item-form").addEventListener("submit",e=>{
    e.preventDefault();const idx=$("item-id").value;
    const it={name:$("item-name").value.trim(),category:$("item-category").value,quality:$("item-quality").value,bonus:$("item-bonus").value};
    if(!it.name){showToast("Informe o nome do item.");return}
    if(idx!=="")character.items[Number(idx)]=it;else character.items.push(it);
    $("item-dialog").close();renderItems();showToast("Item registrado.");
  });
  $("add-title").addEventListener("click",()=>{
    if(character.titles.length>=3){showToast("O personagem pode armazenar até 3 títulos.");return}
    character.titles.push({name:"",equipped:character.titles.length===0});renderTitles();
  });
  $("add-ability").addEventListener("click",()=>{character.abilities.push({name:"",description:""});renderAbilities()});
  $("add-skill").addEventListener("click",()=>{
    const name=prompt("Nome da perícia que deseja registrar:");if(name&&name.trim()){character.skills=[...new Set([...character.skills,name.trim()])];renderSkills();showToast("Perícia adicionada.")}
  });
  $("add-spell").addEventListener("click",()=>openSpell());
  $("add-item").addEventListener("click",()=>openItem());
  $("save-character").addEventListener("click",saveCurrent);$("save-bottom").addEventListener("click",saveCurrent);
  $("new-character").addEventListener("click",newCharacter);
  $("export-json").addEventListener("click",()=>exportJson());
  $("print-sheet").addEventListener("click",()=>window.print());
  document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showView(b.dataset.view)));
  $("library-list").addEventListener("click",e=>{
    const load=e.target.closest("[data-load]"),del=e.target.closest("[data-delete]"),exp=e.target.closest("[data-export]");
    if(load){const found=getSaved().find(c=>c.id===load.dataset.load);if(found){character=JSON.parse(JSON.stringify(found));renderAll();showView("character");showToast("Ficha carregada.")}}
    if(del&&confirm("Excluir permanentemente esta ficha salva neste navegador?")){localStorage.setItem(STORAGE_KEY,JSON.stringify(getSaved().filter(c=>c.id!==del.dataset.delete)));renderLibrary();showToast("Ficha excluída.")}
    if(exp){const found=getSaved().find(c=>c.id===exp.dataset.export);if(found)exportJson(found)}
  });
  // Importação de backup JSON via atalho na página de personagens salvos.
  const importButton=document.createElement("button");importButton.className="btn btn-outline";importButton.textContent="Importar JSON";importButton.addEventListener("click",()=>$("import-file").click());
  $("view-library").querySelector(".section-heading").appendChild(importButton);
  $("import-file").addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      const parsed=JSON.parse(await file.text());
      const incoming=Array.isArray(parsed)?parsed:[parsed];
      if(!incoming.length||!incoming.every(c=>c&&typeof c==="object"&&c.attributes&&c.resources))throw new Error("Formato inválido");
      const saved=getSaved();
      incoming.forEach(c=>{if(!c.id)c.id=makeId();const i=saved.findIndex(x=>x.id===c.id);if(i>=0)saved[i]=c;else saved.unshift(c)});
      localStorage.setItem(STORAGE_KEY,JSON.stringify(saved));renderLibrary();showToast("Importação concluída.");
    }catch{showToast("Não foi possível importar: arquivo JSON inválido.");}
    e.target.value="";
  });
  bindTextFields();renderAll();renderLibrary();
})();