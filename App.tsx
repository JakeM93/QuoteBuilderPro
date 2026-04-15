import React, { useCallback, useMemo, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';

// ─── Utils ────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 10);
const money = (v) => `£${Number(v || 0).toFixed(2)}`;

const calcTotalsForQuote = (quote, clients, pricingProfiles) => {
  const client = clients.find((c) => c.id === quote.clientId);
  const profile =
    pricingProfiles.find((p) => p.id === client?.pricingProfileId) ||
    pricingProfiles[0];
  const marginPct = profile?.marginPct || 0;
  const vatRate = profile?.vatRate || 0;

  let labourCost = 0;
  let materialCost = 0;
  let internalSell = 0;

  quote.rooms
    .filter((r) => r.included)
    .forEach((room) => {
      room.items
        .filter((i) => i.included)
        .forEach((item) => {
          const baseLabour = item.labour * item.quantity;
          const baseMaterial = item.materials * item.quantity;
          const complexity = profile.complexityMultipliers[item.complexity] || 1;
          const spec = profile.specMultipliers[item.spec] || 1;
          const cost = (baseLabour + baseMaterial) * complexity * spec;
          labourCost += baseLabour;
          materialCost += baseMaterial;
          internalSell += cost * (1 + marginPct / 100);
        });
    });

  const customerSubtotal = quote.rooms
    .filter((r) => r.included)
    .reduce((sum, room) => {
      return (
        sum +
        room.items
          .filter((i) => i.included)
          .reduce((roomSum, item) => {
            const baseLabour = item.labour * item.quantity;
            const baseMaterial = item.materials * item.quantity;
            const complexity = profile.complexityMultipliers[item.complexity] || 1;
            const spec = profile.specMultipliers[item.spec] || 1;
            return roomSum + (baseLabour + baseMaterial) * complexity * spec;
          }, 0)
      );
    }, 0);

  const subtotal = internalSell;
  const vat = customerSubtotal * vatRate;
  const total = customerSubtotal + vat;
  const estimatedCost = labourCost + materialCost;
  const profit = subtotal - estimatedCost;
  const profitPct = subtotal > 0 ? (profit / subtotal) * 100 : 0;

  return { labourCost, materialCost, estimatedCost, customerSubtotal, subtotal, vat, total, profit, profitPct };
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const DEFAULT_ITEMS = {
  Power: [
    { id: uid(), name: 'Double Socket', labour: 25, materials: 18 },
    { id: uid(), name: 'Cooker Connection', labour: 45, materials: 30 },
    { id: uid(), name: 'Fused Spur', labour: 22, materials: 12 },
  ],
  Lighting: [
    { id: uid(), name: 'Downlight', labour: 18, materials: 11 },
    { id: uid(), name: 'Pendant Light', labour: 20, materials: 10 },
    { id: uid(), name: 'LED Strip', labour: 30, materials: 22 },
  ],
  Other: [
    { id: uid(), name: 'Extractor Fan', labour: 35, materials: 28 },
    { id: uid(), name: 'Smoke Alarm', labour: 20, materials: 14 },
    { id: uid(), name: 'Data Point', labour: 28, materials: 16 },
  ],
};

const DEFAULT_PROFILE_ID = uid();
const DEFAULT_CLIENT_ID = uid();
const DEFAULT_QUOTE_ID = uid();
const DEFAULT_ROOM_ID = uid();

const defaultPricingProfiles = [
  {
    id: DEFAULT_PROFILE_ID,
    name: 'Standard Domestic',
    vatRate: 0.2,
    marginPct: 25,
    complexityMultipliers: { 'New Install': 1.0, Modification: 1.35 },
    specMultipliers: { Standard: 1.0, Premium: 1.2 },
    catalogue: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
  },
];

const defaultClients = [
  {
    id: DEFAULT_CLIENT_ID,
    clientName: 'Demo Client',
    companyName: '',
    billingAddress: '1 Demo Street',
    siteAddress: '1 Demo Street',
    contactName: 'Site Contact',
    contactPhone: '07123 456789',
    contactEmail: 'demo@example.com',
    pricingProfileId: DEFAULT_PROFILE_ID,
    notes: 'Standard domestic client',
  },
];

const defaultQuotes = [
  {
    id: DEFAULT_QUOTE_ID,
    quoteNumber: 'EQ-1001',
    clientId: DEFAULT_CLIENT_ID,
    status: 'Draft',
    title: 'Demo House Rewire Quote',
    createdAt: '2026-04-07',
    description: 'Supply and install new power and lighting works throughout the property.',
    exclusions: 'Decoration, making good, and unforeseen hidden defects are excluded unless stated.',
    activity: [{ id: uid(), action: 'Quote created', date: '2026-04-07', note: '' }],
    rooms: [
      {
        id: DEFAULT_ROOM_ID,
        name: 'Kitchen',
        included: true,
        description: 'Supply and install kitchen power and lighting modifications.',
        items: [
          { id: uid(), included: true, category: 'Power', name: 'Double Socket', quantity: 4, labour: 25, materials: 18, complexity: 'Modification', spec: 'Standard', notes: 'Install above worktop where practical' },
          { id: uid(), included: true, category: 'Lighting', name: 'Downlight', quantity: 6, labour: 18, materials: 11, complexity: 'New Install', spec: 'Premium', notes: 'Warm white LED downlights' },
        ],
      },
    ],
  },
];

const companyDefaults = {
  companyName: 'Soar Electrical',
  address: 'Unit 1, Long Eaton',
  phone: '0115 000 0000',
  email: 'quotes@soarelectrical.co.uk',
  website: 'www.soarelectrical.co.uk',
  quotePrefix: 'EQ',
  nextQuoteNumber: 1002,
  defaultTerms: 'Payment due within 7 days of invoice unless otherwise agreed. Materials remain property of the contractor until paid in full.',
  defaultExclusions: 'Decoration, making good, asbestos removal, and structural works excluded unless stated.',
};

const TABS = ['Home', 'Quotes', 'Clients', 'Pricing', 'Reports', 'Settings'];

// ─── UI Components ────────────────────────────────────────────────────────────

function Card({ title, children }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function StatCard({ title, value }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{title}</Text>
    </View>
  );
}

function Label({ text }) {
  return <Text style={s.label}>{text}</Text>;
}

function Input(props) {
  return (
    <TextInput
      placeholderTextColor="#6b7280"
      style={[s.input, props.multiline && s.inputMulti]}
      {...props}
    />
  );
}

function Button({ text, onPress }) {
  return (
    <TouchableOpacity style={s.button} onPress={onPress}>
      <Text style={s.buttonText}>{text}</Text>
    </TouchableOpacity>
  );
}

function ChipRow({ options, selected, onSelect }) {
  return (
    <View style={s.chipRow}>
      {options.map((o) => {
        const active = selected === o.key;
        return (
          <TouchableOpacity key={o.key} onPress={() => onSelect(o.key)} style={[s.chip, active && s.chipActive]}>
            <Text style={[s.chipText, active && s.chipTextActive]}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function InfoRow({ label, value, strong, compact }) {
  return (
    <View style={[s.infoRow, compact && { marginBottom: 6 }]}>
      <Text style={[s.infoLabel, strong && s.strongText]}>{label}</Text>
      <Text style={[s.infoValue, strong && s.strongText]}>{value}</Text>
    </View>
  );
}

// ─── Preview Components ───────────────────────────────────────────────────────

function DocumentPreview({ company, quote, client, totals }) {
  return (
    <View style={s.docPage}>
      <Text style={s.docCompany}>{company.companyName}</Text>
      <Text style={s.docSmall}>{company.address}</Text>
      <Text style={s.docSmall}>{company.phone} • {company.email}</Text>
      <View style={s.docDivider} />
      <Text style={s.docHeading}>Quotation</Text>
      <Text style={s.docSmall}>{quote.quoteNumber}</Text>
      <Text style={s.docSmall}>Date: {quote.createdAt}</Text>
      <Text style={s.docSection}>Client</Text>
      <Text style={s.docSmall}>{client?.clientName}</Text>
      {client?.companyName ? <Text style={s.docSmall}>{client.companyName}</Text> : null}
      <Text style={s.docSmall}>{client?.billingAddress}</Text>
      <Text style={s.docSection}>Site Address</Text>
      <Text style={s.docSmall}>{client?.siteAddress}</Text>
      <Text style={s.docSection}>Description of Works</Text>
      <Text style={s.docBody}>{quote.description}</Text>
      {quote.rooms.filter((r) => r.included).map((room) => (
        <View key={room.id} style={{ marginBottom: 8 }}>
          <Text style={s.docSection}>{room.name}</Text>
          <Text style={s.docBody}>{room.description || 'Electrical works as discussed on site.'}</Text>
        </View>
      ))}
      <Text style={s.docSection}>Exclusions / Assumptions</Text>
      <Text style={s.docBody}>{quote.exclusions}</Text>
      <View style={s.docDivider} />
      <InfoRow label="Subtotal" value={money(totals.customerSubtotal)} compact />
      <InfoRow label="VAT" value={money(totals.vat)} compact />
      <InfoRow label="Total" value={money(totals.total)} compact strong />
      <Text style={s.docSection}>Acceptance</Text>
      <Text style={s.docBody}>We accept this quotation and authorise the works to proceed.</Text>
      <Text style={s.docSmall}>Signed: ____________________    Date: ____________________</Text>
      <Text style={s.docSection}>Terms</Text>
      <Text style={s.docBody}>{company.defaultTerms}</Text>
    </View>
  );
}

function BreakdownPreview({ quote, totals, profile }) {
  return (
    <View>
      {quote.rooms.filter((r) => r.included).map((room) => (
        <View key={room.id} style={s.itemCardSoft}>
          <Text style={s.groupTitle}>{room.name}</Text>
          {room.items.filter((i) => i.included).map((item) => {
            const multiplier = (profile.complexityMultipliers[item.complexity] || 1) * (profile.specMultipliers[item.spec] || 1);
            const line = (item.labour + item.materials) * item.quantity * multiplier;
            return (
              <View key={item.id} style={s.listRow}>
                <Text style={s.listTitle}>{item.name} x{item.quantity}</Text>
                <Text style={s.listMeta}>{item.category} • {item.notes || 'No notes'} • {money(line)}</Text>
              </View>
            );
          })}
        </View>
      ))}
      <InfoRow label="Subtotal" value={money(totals.customerSubtotal)} />
      <InfoRow label="VAT" value={money(totals.vat)} />
      <InfoRow label="Total" value={money(totals.total)} strong />
    </View>
  );
}

function InternalPreview({ totals }) {
  return (
    <View>
      <InfoRow label="Labour Cost" value={money(totals.labourCost)} />
      <InfoRow label="Material Cost" value={money(totals.materialCost)} />
      <InfoRow label="Estimated Cost" value={money(totals.estimatedCost)} />
      <InfoRow label="Internal Sell Before VAT" value={money(totals.subtotal)} />
      <InfoRow label="Customer Sell Before VAT" value={money(totals.customerSubtotal)} />
      <InfoRow label="Estimated Profit" value={money(totals.profit)} />
      <InfoRow label="Profit %" value={`${totals.profitPct.toFixed(1)}%`} strong />
    </View>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('Home');
  const [pricingProfiles, setPricingProfiles] = useState(defaultPricingProfiles);
  const [clients, setClients] = useState(defaultClients);
  const [quotes, setQuotes] = useState(defaultQuotes);
  const [company, setCompany] = useState(companyDefaults);
  const [selectedQuoteId, setSelectedQuoteId] = useState(DEFAULT_QUOTE_ID);
  const [selectedRoomId, setSelectedRoomId] = useState(DEFAULT_ROOM_ID);
  const [quoteViewMode, setQuoteViewMode] = useState('Client Quote');

  const selectedQuote = quotes.find((q) => q.id === selectedQuoteId) || quotes[0];
  const selectedClient = clients.find((c) => c.id === selectedQuote?.clientId) || clients[0];
  const selectedProfile = pricingProfiles.find((p) => p.id === selectedClient?.pricingProfileId) || pricingProfiles[0];
  const selectedRoom = selectedQuote?.rooms.find((r) => r.id === selectedRoomId) || selectedQuote?.rooms[0];

  const calcTotals = useCallback(
    (quote) => calcTotalsForQuote(quote, clients, pricingProfiles),
    [clients, pricingProfiles]
  );

  const selectedTotals = selectedQuote ? calcTotals(selectedQuote) : null;

  const dashboardStats = useMemo(() => ({
    totalClients: clients.length,
    totalQuotes: quotes.length,
    draftQuotes: quotes.filter((q) => q.status === 'Draft').length,
    acceptedQuotes: quotes.filter((q) => q.status === 'Accepted').length,
    rejectedQuotes: quotes.filter((q) => q.status === 'Rejected').length,
    sentQuotes: quotes.filter((q) => q.status === 'Sent').length,
    totalQuotedValue: quotes.reduce((sum, q) => sum + calcTotals(q).total, 0),
    totalProfit: quotes.reduce((sum, q) => sum + calcTotals(q).profit, 0),
  }), [clients, quotes, calcTotals]);

  const totalByClient = useMemo(() =>
    clients.map((client) => {
      const cq = quotes.filter((q) => q.clientId === client.id);
      return {
        clientName: client.clientName,
        total: cq.reduce((sum, q) => sum + calcTotals(q).total, 0),
        profit: cq.reduce((sum, q) => sum + calcTotals(q).profit, 0),
      };
    }), [clients, quotes, calcTotals]);

  const updateQuote = (quoteId, updater) =>
    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? updater(q) : q)));

  const addClient = () => {
    const client = { id: uid(), clientName: `Client ${clients.length + 1}`, companyName: '', billingAddress: '', siteAddress: '', contactName: '', contactPhone: '', contactEmail: '', pricingProfileId: pricingProfiles[0]?.id, notes: '' };
    setClients((prev) => [client, ...prev]);
    Alert.alert('Client added');
  };

  const addQuote = () => {
    const clientId = clients[0]?.id;
    if (!clientId) return Alert.alert('Add a client first');
    const newRoomId = uid();
    const quote = {
      id: uid(), quoteNumber: `${company.quotePrefix}-${company.nextQuoteNumber}`, clientId, status: 'Draft',
      title: `New Quote ${company.nextQuoteNumber}`, createdAt: new Date().toISOString().slice(0, 10),
      description: 'Description of works', exclusions: company.defaultExclusions,
      activity: [{ id: uid(), action: 'Quote created', date: new Date().toISOString().slice(0, 10), note: '' }],
      rooms: [{ id: newRoomId, name: 'Room 1', included: true, description: 'Room scope of works', items: [] }],
    };
    setQuotes((prev) => [quote, ...prev]);
    setSelectedQuoteId(quote.id);
    setSelectedRoomId(newRoomId);
    setCompany((prev) => ({ ...prev, nextQuoteNumber: prev.nextQuoteNumber + 1 }));
    setTab('Quotes');
  };

  const addRoom = () => {
    const room = { id: uid(), name: `Room ${selectedQuote.rooms.length + 1}`, included: true, description: '', items: [] };
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: [...q.rooms, room] }));
    setSelectedRoomId(room.id);
  };

  const duplicateRoom = (roomId) => {
    const room = selectedQuote.rooms.find((r) => r.id === roomId);
    if (!room) return;
    const dup = { ...JSON.parse(JSON.stringify(room)), id: uid(), name: `${room.name} Copy`, items: room.items.map((i) => ({ ...i, id: uid() })) };
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: [...q.rooms, dup], activity: [...q.activity, { id: uid(), action: 'Room duplicated', date: new Date().toISOString().slice(0, 10), note: room.name }] }));
  };

  const addItemToRoom = (category, itemName) => {
    const source = selectedProfile.catalogue[category]?.find((i) => i.name === itemName);
    if (!source) return;
    const item = { id: uid(), included: true, category, name: source.name, quantity: 1, labour: source.labour, materials: source.materials, complexity: 'New Install', spec: 'Standard', notes: '' };
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: q.rooms.map((r) => r.id === selectedRoomId ? { ...r, items: [...r.items, item] } : r) }));
  };

  const addCustomItemToRoom = () => {
    const item = { id: uid(), included: true, category: 'Other', name: 'Custom Item', quantity: 1, labour: 0, materials: 0, complexity: 'New Install', spec: 'Standard', notes: '' };
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: q.rooms.map((r) => r.id === selectedRoomId ? { ...r, items: [...r.items, item] } : r) }));
  };

  const updateRoom = (roomId, patch) =>
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: q.rooms.map((r) => r.id === roomId ? { ...r, ...patch } : r) }));

  const updateItem = (roomId, itemId, patch) =>
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: q.rooms.map((r) => r.id === roomId ? { ...r, items: r.items.map((i) => i.id === itemId ? { ...i, ...patch } : i) } : r) }));

  const removeItem = (roomId, itemId) =>
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: q.rooms.map((r) => r.id === roomId ? { ...r, items: r.items.filter((i) => i.id !== itemId) } : r) }));

  const createPricingItem = (category) => {
    const newItem = { id: uid(), name: `New ${category} Item`, labour: 0, materials: 0 };
    setPricingProfiles((prev) => prev.map((p) => p.id === selectedProfile.id ? { ...p, catalogue: { ...p.catalogue, [category]: [...p.catalogue[category], newItem] } } : p));
  };

  const updateCatalogueItem = (profileId, category, itemId, patch) =>
    setPricingProfiles((prev) => prev.map((p) => p.id === profileId ? { ...p, catalogue: { ...p.catalogue, [category]: p.catalogue[category].map((i) => i.id === itemId ? { ...i, ...patch } : i) } } : p));

  const addPricingProfile = () => {
    const profile = { id: uid(), name: `Profile ${pricingProfiles.length + 1}`, vatRate: 0.2, marginPct: 25, complexityMultipliers: { 'New Install': 1.0, Modification: 1.35 }, specMultipliers: { Standard: 1.0, Premium: 1.2 }, catalogue: JSON.parse(JSON.stringify(DEFAULT_ITEMS)) };
    setPricingProfiles((prev) => [profile, ...prev]);
  };

  const setQuoteStatus = (status) =>
    updateQuote(selectedQuote.id, (q) => ({ ...q, status, activity: [...q.activity, { id: uid(), action: `Status set to ${status}`, date: new Date().toISOString().slice(0, 10), note: '' }] }));

  const duplicateQuote = () => {
    const cloned = JSON.parse(JSON.stringify(selectedQuote));
    cloned.id = uid();
    cloned.quoteNumber = `${company.quotePrefix}-${company.nextQuoteNumber}`;
    cloned.title = `${selectedQuote.title} Copy`;
    cloned.createdAt = new Date().toISOString().slice(0, 10);
    cloned.status = 'Draft';
    cloned.activity = [{ id: uid(), action: 'Quote duplicated', date: new Date().toISOString().slice(0, 10), note: selectedQuote.quoteNumber }];
    cloned.rooms = cloned.rooms.map((r) => ({ ...r, id: uid(), items: r.items.map((i) => ({ ...i, id: uid() })) }));
    setQuotes((prev) => [cloned, ...prev]);
    setSelectedQuoteId(cloned.id);
    setSelectedRoomId(cloned.rooms[0]?.id);
    setCompany((prev) => ({ ...prev, nextQuoteNumber: prev.nextQuoteNumber + 1 }));
  };

  const reviseQuote = () => {
    const currentRevLetter = selectedQuote.revision ? selectedQuote.revision.replace('Rev ', '') : '@';
    const nextRev = String.fromCharCode(currentRevLetter.charCodeAt(0) + 1);
    updateQuote(selectedQuote.id, (q) => ({ ...q, revision: `Rev ${nextRev}`, activity: [...q.activity, { id: uid(), action: 'Quote revised', date: new Date().toISOString().slice(0, 10), note: `Rev ${nextRev}` }] }));
  };

  return (
    <SafeAreaView style={s.container}>
      <View style={s.topBar}>
        <Text style={s.topTitle}>Quote Builder Pro</Text>
        <Text style={s.topSub}>Electrician quotation workflow</Text>
      </View>

      <View style={s.tabRow}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} style={[s.tabBtn, tab === t && s.tabBtnActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabBtnText, tab === t && s.tabBtnTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.content}>

        {/* ── Home ── */}
        {tab === 'Home' && (
          <>
            <View style={s.rowWrap}>
              <StatCard title="Clients" value={dashboardStats.totalClients} />
              <StatCard title="Quotes" value={dashboardStats.totalQuotes} />
              <StatCard title="Draft" value={dashboardStats.draftQuotes} />
              <StatCard title="Sent" value={dashboardStats.sentQuotes} />
              <StatCard title="Accepted" value={dashboardStats.acceptedQuotes} />
              <StatCard title="Rejected" value={dashboardStats.rejectedQuotes} />
            </View>
            <Card title="Financial Overview">
              <InfoRow label="Total Quoted Value" value={money(dashboardStats.totalQuotedValue)} />
              <InfoRow label="Total Estimated Profit" value={money(dashboardStats.totalProfit)} />
            </Card>
            <Card title="Quick Actions">
              <Button text="New Quote" onPress={addQuote} />
              <Button text="New Client" onPress={addClient} />
            </Card>
            <Card title="Profit by Client">
              {totalByClient.map((row) => (
                <View key={row.clientName} style={s.listRow}>
                  <Text style={s.listTitle}>{row.clientName}</Text>
                  <Text style={s.listMeta}>{money(row.total)} • Profit {money(row.profit)}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Quotes ── */}
        {tab === 'Quotes' && selectedQuote && (
          <>
            <Card title="Quotes List">
              <Button text="Create New Quote" onPress={addQuote} />
              {quotes.map((q) => {
                const client = clients.find((c) => c.id === q.clientId);
                const totals = calcTotals(q);
                return (
                  <TouchableOpacity key={q.id} style={[s.listRow, q.id === selectedQuoteId && s.selectedRow]} onPress={() => { setSelectedQuoteId(q.id); setSelectedRoomId(q.rooms[0]?.id); }}>
                    <Text style={s.listTitle}>{q.quoteNumber} • {q.title}</Text>
                    <Text style={s.listMeta}>{client?.clientName || 'No client'} • {q.status} • {money(totals.total)}</Text>
                  </TouchableOpacity>
                );
              })}
            </Card>

            <Card title="Quote Header">
              <Label text="Quote Title" />
              <Input value={selectedQuote.title} onChangeText={(v) => updateQuote(selectedQuote.id, (q) => ({ ...q, title: v }))} />
              <Label text="Client" />
              <ChipRow options={clients.map((c) => ({ key: c.id, label: c.clientName }))} selected={selectedQuote.clientId} onSelect={(v) => updateQuote(selectedQuote.id, (q) => ({ ...q, clientId: v }))} />
              <Label text="Description" />
              <Input multiline value={selectedQuote.description} onChangeText={(v) => updateQuote(selectedQuote.id, (q) => ({ ...q, description: v }))} />
              <Label text="Exclusions" />
              <Input multiline value={selectedQuote.exclusions} onChangeText={(v) => updateQuote(selectedQuote.id, (q) => ({ ...q, exclusions: v }))} />
            </Card>

            <Card title="Workflow Actions">
              <ChipRow options={['Draft', 'Sent', 'Accepted', 'Rejected', 'On Hold'].map((s) => ({ key: s, label: s }))} selected={selectedQuote.status} onSelect={setQuoteStatus} />
              <Button text="Duplicate Quote" onPress={duplicateQuote} />
              <Button text="Revise Quote" onPress={reviseQuote} />
            </Card>

            <Card title="Rooms">
              <Button text="Add Room" onPress={addRoom} />
              {selectedQuote.rooms.map((room) => (
                <TouchableOpacity key={room.id} style={[s.roomCard, room.id === selectedRoomId && s.selectedRow]} onPress={() => setSelectedRoomId(room.id)}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listTitle}>{room.name}</Text>
                    <Text style={s.listMeta}>{room.included ? 'Included' : 'Excluded'} • {room.items.length} item(s)</Text>
                  </View>
                  <TouchableOpacity style={s.smallAction} onPress={() => duplicateRoom(room.id)}>
                    <Text style={s.smallActionText}>Duplicate</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </Card>

            {selectedRoom && (
              <Card title={`Edit ${selectedRoom.name}`}>
                <Label text="Room Name" />
                <Input value={selectedRoom.name} onChangeText={(v) => updateRoom(selectedRoom.id, { name: v })} />
                <Label text="Room Description" />
                <Input multiline value={selectedRoom.description} onChangeText={(v) => updateRoom(selectedRoom.id, { description: v })} />
                <TouchableOpacity style={[s.toggle, selectedRoom.included && s.toggleActive]} onPress={() => updateRoom(selectedRoom.id, { included: !selectedRoom.included })}>
                  <Text style={s.toggleText}>{selectedRoom.included ? 'Included in quote' : 'Excluded from quote'}</Text>
                </TouchableOpacity>

                <Label text="Add From Saved Pricing" />
                {Object.keys(selectedProfile.catalogue).map((category) => (
                  <View key={category} style={{ marginBottom: 10 }}>
                    <Text style={s.groupTitle}>{category}</Text>
                    <ChipRow options={selectedProfile.catalogue[category].map((i) => ({ key: i.name, label: i.name }))} selected={null} onSelect={(name) => addItemToRoom(category, name)} />
                  </View>
                ))}
                <Button text="Add Custom Item" onPress={addCustomItemToRoom} />

                {selectedRoom.items.map((item) => (
                  <View key={item.id} style={s.itemCard}>
                    <View style={s.rowBetween}>
                      <Text style={s.listTitle}>{item.name}</Text>
                      <TouchableOpacity style={s.smallDanger} onPress={() => removeItem(selectedRoom.id, item.id)}>
                        <Text style={s.smallDangerText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={[s.toggle, item.included && s.toggleActive]} onPress={() => updateItem(selectedRoom.id, item.id, { included: !item.included })}>
                      <Text style={s.toggleText}>{item.included ? 'Included' : 'Omitted'}</Text>
                    </TouchableOpacity>
                    <Label text="Item Name" />
                    <Input value={item.name} onChangeText={(v) => updateItem(selectedRoom.id, item.id, { name: v })} />
                    <Label text="Category" />
                    <ChipRow options={['Power', 'Lighting', 'Other'].map((x) => ({ key: x, label: x }))} selected={item.category} onSelect={(v) => updateItem(selectedRoom.id, item.id, { category: v })} />
                    <Label text="Quantity" />
                    <Input value={String(item.quantity)} keyboardType="numeric" onChangeText={(v) => updateItem(selectedRoom.id, item.id, { quantity: Number(v) || 0 })} />
                    <Label text="Labour" />
                    <Input value={String(item.labour)} keyboardType="numeric" onChangeText={(v) => updateItem(selectedRoom.id, item.id, { labour: Number(v) || 0 })} />
                    <Label text="Materials" />
                    <Input value={String(item.materials)} keyboardType="numeric" onChangeText={(v) => updateItem(selectedRoom.id, item.id, { materials: Number(v) || 0 })} />
                    <Label text="Complexity" />
                    <ChipRow options={Object.keys(selectedProfile.complexityMultipliers).map((x) => ({ key: x, label: x }))} selected={item.complexity} onSelect={(v) => updateItem(selectedRoom.id, item.id, { complexity: v })} />
                    <Label text="Specification" />
                    <ChipRow options={Object.keys(selectedProfile.specMultipliers).map((x) => ({ key: x, label: x }))} selected={item.spec} onSelect={(v) => updateItem(selectedRoom.id, item.id, { spec: v })} />
                    <Label text="Notes" />
                    <Input multiline value={item.notes} onChangeText={(v) => updateItem(selectedRoom.id, item.id, { notes: v })} />
                  </View>
                ))}
              </Card>
            )}

            <Card title="Quote Preview">
              <ChipRow options={[{ key: 'Client Quote', label: 'Client Quote' }, { key: 'Breakdown', label: 'Breakdown' }, { key: 'Internal', label: 'Internal' }]} selected={quoteViewMode} onSelect={setQuoteViewMode} />
              {quoteViewMode === 'Client Quote' && selectedTotals && <DocumentPreview company={company} quote={selectedQuote} client={selectedClient} totals={selectedTotals} />}
              {quoteViewMode === 'Breakdown' && selectedTotals && <BreakdownPreview quote={selectedQuote} totals={selectedTotals} profile={selectedProfile} />}
              {quoteViewMode === 'Internal' && selectedTotals && <InternalPreview totals={selectedTotals} />}
            </Card>

            <Card title="Activity Timeline">
              {selectedQuote.activity.slice().reverse().map((a) => (
                <View key={a.id} style={s.listRow}>
                  <Text style={s.listTitle}>{a.action}</Text>
                  <Text style={s.listMeta}>{a.date}{a.note ? ` • ${a.note}` : ''}</Text>
                </View>
              ))}
            </Card>
          </>
        )}

        {/* ── Clients ── */}
        {tab === 'Clients' && (
          <Card title="Clients">
            <Button text="Add Client" onPress={addClient} />
            {clients.map((client) => (
              <View key={client.id} style={s.itemCard}>
                <Label text="Client Name" />
                <Input value={client.clientName} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, clientName: v } : c))} />
                <Label text="Company Name" />
                <Input value={client.companyName} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, companyName: v } : c))} />
                <Label text="Billing Address" />
                <Input multiline value={client.billingAddress} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, billingAddress: v } : c))} />
                <Label text="Site Address" />
                <Input multiline value={client.siteAddress} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, siteAddress: v } : c))} />
                <Label text="Contact Name" />
                <Input value={client.contactName} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, contactName: v } : c))} />
                <Label text="Phone" />
                <Input value={client.contactPhone} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, contactPhone: v } : c))} />
                <Label text="Email" />
                <Input value={client.contactEmail} onChangeText={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, contactEmail: v } : c))} />
                <Label text="Pricing Profile" />
                <ChipRow options={pricingProfiles.map((p) => ({ key: p.id, label: p.name }))} selected={client.pricingProfileId} onSelect={(v) => setClients((prev) => prev.map((c) => c.id === client.id ? { ...c, pricingProfileId: v } : c))} />
              </View>
            ))}
          </Card>
        )}

        {/* ── Pricing ── */}
        {tab === 'Pricing' && (
          <Card title="Pricing Profiles">
            <Button text="Add Pricing Profile" onPress={addPricingProfile} />
            {pricingProfiles.map((profile) => (
              <View key={profile.id} style={s.itemCard}>
                <Label text="Profile Name" />
                <Input value={profile.name} onChangeText={(v) => setPricingProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, name: v } : p))} />
                <Label text="Internal Margin %" />
                <Input value={String(profile.marginPct)} keyboardType="numeric" onChangeText={(v) => setPricingProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, marginPct: Number(v) || 0 } : p))} />
                <Label text="VAT Rate" />
                <Input value={String(profile.vatRate)} keyboardType="numeric" onChangeText={(v) => setPricingProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, vatRate: Number(v) || 0 } : p))} />
                <Label text="Complexity Multipliers" />
                {Object.entries(profile.complexityMultipliers).map(([key, value]) => (
                  <View key={key} style={s.inlineField}>
                    <Text style={s.inlineLabel}>{key}</Text>
                    <TextInput style={s.inlineInput} value={String(value)} keyboardType="numeric" onChangeText={(v) => setPricingProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, complexityMultipliers: { ...p.complexityMultipliers, [key]: Number(v) || 0 } } : p))} />
                  </View>
                ))}
                <Label text="Specification Multipliers" />
                {Object.entries(profile.specMultipliers).map(([key, value]) => (
                  <View key={key} style={s.inlineField}>
                    <Text style={s.inlineLabel}>{key}</Text>
                    <TextInput style={s.inlineInput} value={String(value)} keyboardType="numeric" onChangeText={(v) => setPricingProfiles((prev) => prev.map((p) => p.id === profile.id ? { ...p, specMultipliers: { ...p.specMultipliers, [key]: Number(v) || 0 } } : p))} />
                  </View>
                ))}
                {Object.keys(profile.catalogue).map((category) => (
                  <View key={category} style={{ marginTop: 8 }}>
                    <View style={s.rowBetween}>
                      <Text style={s.groupTitle}>{category}</Text>
                      <TouchableOpacity style={s.smallAction} onPress={() => createPricingItem(category)}>
                        <Text style={s.smallActionText}>Add Item</Text>
                      </TouchableOpacity>
                    </View>
                    {profile.catalogue[category].map((item) => (
                      <View key={item.id} style={s.itemCardSoft}>
                        <Label text="Item Name" />
                        <Input value={item.name} onChangeText={(v) => updateCatalogueItem(profile.id, category, item.id, { name: v })} />
                        <Label text="Labour" />
                        <Input value={String(item.labour)} keyboardType="numeric" onChangeText={(v) => updateCatalogueItem(profile.id, category, item.id, { labour: Number(v) || 0 })} />
                        <Label text="Materials" />
                        <Input value={String(item.materials)} keyboardType="numeric" onChangeText={(v) => updateCatalogueItem(profile.id, category, item.id, { materials: Number(v) || 0 })} />
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </Card>
        )}

        {/* ── Reports ── */}
        {tab === 'Reports' && (
          <Card title="Profit & Loss">
            {quotes.map((q) => {
              const client = clients.find((c) => c.id === q.clientId);
              const totals = calcTotals(q);
              return (
                <View key={q.id} style={s.listRow}>
                  <Text style={s.listTitle}>{q.quoteNumber} • {client?.clientName}</Text>
                  <Text style={s.listMeta}>Sell {money(totals.total)} • Cost {money(totals.estimatedCost)} • Profit {money(totals.profit)}</Text>
                </View>
              );
            })}
          </Card>
        )}

        {/* ── Settings ── */}
        {tab === 'Settings' && (
          <Card title="Company Branding & Defaults">
            <Label text="Company Name" />
            <Input value={company.companyName} onChangeText={(v) => setCompany((p) => ({ ...p, companyName: v }))} />
            <Label text="Address" />
            <Input multiline value={company.address} onChangeText={(v) => setCompany((p) => ({ ...p, address: v }))} />
            <Label text="Phone" />
            <Input value={company.phone} onChangeText={(v) => setCompany((p) => ({ ...p, phone: v }))} />
            <Label text="Email" />
            <Input value={company.email} onChangeText={(v) => setCompany((p) => ({ ...p, email: v }))} />
            <Label text="Website" />
            <Input value={company.website} onChangeText={(v) => setCompany((p) => ({ ...p, website: v }))} />
            <Label text="Quote Prefix" />
            <Input value={company.quotePrefix} onChangeText={(v) => setCompany((p) => ({ ...p, quotePrefix: v }))} />
            <Label text="Next Quote Number" />
            <Input value={String(company.nextQuoteNumber)} keyboardType="numeric" onChangeText={(v) => setCompany((p) => ({ ...p, nextQuoteNumber: Number(v) || 1 }))} />
            <Label text="Default Terms" />
            <Input multiline value={company.defaultTerms} onChangeText={(v) => setCompany((p) => ({ ...p, defaultTerms: v }))} />
            <Label text="Default Exclusions" />
            <Input multiline value={company.defaultExclusions} onChangeText={(v) => setCompany((p) => ({ ...p, defaultExclusions: v }))} />
          </Card>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  topBar: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, backgroundColor: '#111827' },
  topTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  topSub: { color: '#d1d5db', fontSize: 13, marginTop: 2 },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, gap: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tabBtn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: '#f3f4f6' },
  tabBtnActive: { backgroundColor: '#111827' },
  tabBtnText: { color: '#111827', fontWeight: '700', fontSize: 13 },
  tabBtnTextActive: { color: '#fff' },
  content: { padding: 14, paddingBottom: 40 },
  card: { backgroundColor: '#fff', padding: 14, borderRadius: 18, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  cardTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  statValue: { fontSize: 22, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginTop: 8, marginBottom: 6 },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: '#111827' },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#111827', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 9, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 999, marginBottom: 8 },
  chipActive: { backgroundColor: '#111827', borderColor: '#111827' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  chipTextActive: { color: '#fff' },
  listRow: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  selectedRow: { backgroundColor: '#eef2ff', borderRadius: 12, paddingHorizontal: 10 },
  listTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  listMeta: { fontSize: 12, color: '#6b7280', marginTop: 3 },
  roomCard: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10, borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
  itemCard: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 12, marginTop: 10, borderWidth: 1, borderColor: '#e5e7eb' },
  itemCardSoft: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 10, marginTop: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  smallAction: { backgroundColor: '#dbeafe', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  smallActionText: { color: '#1d4ed8', fontWeight: '800', fontSize: 12 },
  smallDanger: { backgroundColor: '#fee2e2', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  smallDangerText: { color: '#991b1b', fontWeight: '800', fontSize: 12 },
  toggle: { marginTop: 8, borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleActive: { backgroundColor: '#111827', borderColor: '#111827' },
  toggleText: { color: '#fff', fontWeight: '800' },
  groupTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, gap: 10 },
  infoLabel: { color: '#374151', fontSize: 14 },
  infoValue: { color: '#111827', fontSize: 14, fontWeight: '700' },
  strongText: { fontWeight: '800', fontSize: 15 },
  inlineField: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  inlineLabel: { flex: 1, fontSize: 14, color: '#374151', fontWeight: '700' },
  inlineInput: { width: 90, backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: '#111827' },
  docPage: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 18, marginTop: 10 },
  docCompany: { fontSize: 22, fontWeight: '800', color: '#111827' },
  docHeading: { fontSize: 20, fontWeight: '800', color: '#111827', marginTop: 12 },
  docSection: { fontSize: 15, fontWeight: '800', color: '#111827', marginTop: 12, marginBottom: 4 },
  docSmall: { fontSize: 12, color: '#374151', marginBottom: 2 },
  docBody: { fontSize: 13, color: '#111827', lineHeight: 20 },
  docDivider: { height: 1, backgroundColor: '#d1d5db', marginVertical: 10 },
});
