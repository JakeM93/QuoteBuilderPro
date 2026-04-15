import React, { useCallback, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, Alert } from 'react-native';

import TabBar, { TabName } from './navigation/TabBar';
import HomeScreen from './screens/HomeScreen';
import QuotesScreen from './screens/QuotesScreen';
import ClientsScreen from './screens/ClientsScreen';
import PricingScreen from './screens/PricingScreen';
import ReportsScreen from './screens/ReportsScreen';
import SettingsScreen from './screens/SettingsScreen';

import {
  defaultPricingProfiles,
  defaultClients,
  defaultQuotes,
  companyDefaults,
  DEFAULT_ITEMS,
  DEFAULT_QUOTE_ID,
} from './constants/defaults';
import uid from './utils/uid';
import totalsForQuote from './utils/totals';
import styles from './styles/styles';
import {
  Quote,
  Client,
  PricingProfile,
  Room,
  QuoteItem,
  Company,
  DashboardStats,
  ClientTotalsRow,
} from './types';

export default function App() {
  const [tab, setTab] = useState<TabName>('Home');
  const [pricingProfiles, setPricingProfiles] = useState<PricingProfile[]>(defaultPricingProfiles);
  const [clients, setClients] = useState<Client[]>(defaultClients);
  const [quotes, setQuotes] = useState<Quote[]>(defaultQuotes);
  const [company, setCompany] = useState<Company>(companyDefaults);
  const [selectedQuoteId, setSelectedQuoteId] = useState<string>(DEFAULT_QUOTE_ID);
  const [selectedRoomId, setSelectedRoomId] = useState<string>(defaultQuotes[0].rooms[0].id);
  const [quoteViewMode, setQuoteViewMode] = useState<'Client Quote' | 'Breakdown' | 'Internal'>('Client Quote');

  const selectedQuote = quotes.find((q) => q.id === selectedQuoteId) ?? quotes[0];
  const selectedClient = clients.find((c) => c.id === selectedQuote?.clientId) ?? clients[0];
  const selectedProfile =
    pricingProfiles.find((p) => p.id === selectedClient?.pricingProfileId) ??
    pricingProfiles[0];
  const selectedRoom =
    selectedQuote?.rooms.find((r) => r.id === selectedRoomId) ??
    selectedQuote?.rooms[0];

  const calcTotals = useCallback(
    (quote: Quote) => totalsForQuote(quote, clients, pricingProfiles),
    [clients, pricingProfiles]
  );

  const selectedTotals = selectedQuote ? calcTotals(selectedQuote) : null;

  const dashboardStats = useMemo<DashboardStats>(() => {
    return {
      totalClients: clients.length,
      totalQuotes: quotes.length,
      draftQuotes: quotes.filter((q) => q.status === 'Draft').length,
      acceptedQuotes: quotes.filter((q) => q.status === 'Accepted').length,
      rejectedQuotes: quotes.filter((q) => q.status === 'Rejected').length,
      sentQuotes: quotes.filter((q) => q.status === 'Sent').length,
      totalQuotedValue: quotes.reduce((sum, q) => sum + calcTotals(q).total, 0),
      totalProfit: quotes.reduce((sum, q) => sum + calcTotals(q).profit, 0),
    };
  }, [clients, quotes, calcTotals]);

  const totalByClient = useMemo<ClientTotalsRow[]>(() => {
    return clients.map((client) => {
      const clientQuotes = quotes.filter((q) => q.clientId === client.id);
      return {
        clientName: client.clientName,
        total: clientQuotes.reduce((sum, q) => sum + calcTotals(q).total, 0),
        profit: clientQuotes.reduce((sum, q) => sum + calcTotals(q).profit, 0),
      };
    });
  }, [clients, quotes, calcTotals]);

  const addClient = () => {
    const client: Client = {
      id: uid(),
      clientName: `Client ${clients.length + 1}`,
      companyName: '',
      billingAddress: '',
      siteAddress: '',
      contactName: '',
      contactPhone: '',
      contactEmail: '',
      pricingProfileId: pricingProfiles[0]?.id,
      notes: '',
    };
    setClients((prev) => [client, ...prev]);
    Alert.alert('Client added');
  };

  const addQuote = () => {
    const clientId = clients[0]?.id;
    if (!clientId) return Alert.alert('Add a client first');
    const newRoomId = uid();
    const quote: Quote = {
      id: uid(),
      quoteNumber: `${company.quotePrefix}-${company.nextQuoteNumber}`,
      clientId,
      status: 'Draft',
      title: `New Quote ${company.nextQuoteNumber}`,
      createdAt: new Date().toISOString().slice(0, 10),
      description: 'Description of works',
      exclusions: company.defaultExclusions,
      activity: [
        {
          id: uid(),
          action: 'Quote created',
          date: new Date().toISOString().slice(0, 10),
          note: '',
        },
      ],
      rooms: [
        {
          id: newRoomId,
          name: 'Room 1',
          included: true,
          description: 'Room scope of works',
          items: [],
        },
      ],
    };
    setQuotes((prev) => [quote, ...prev]);
    setSelectedQuoteId(quote.id);
    setSelectedRoomId(newRoomId);
    setCompany((prev) => ({ ...prev, nextQuoteNumber: prev.nextQuoteNumber + 1 }));
    setTab('Quotes');
  };

  const updateQuote = (quoteId: string, updater: (q: Quote) => Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === quoteId ? updater(q) : q)));
  };

  const addRoom = () => {
    const room: Room = {
      id: uid(),
      name: `Room ${selectedQuote.rooms.length + 1}`,
      included: true,
      description: '',
      items: [],
    };
    updateQuote(selectedQuote.id, (q) => ({ ...q, rooms: [...q.rooms, room] }));
    setSelectedRoomId(room.id);
  };

  const duplicateRoom = (roomId: string) => {
    const room = selectedQuote.rooms.find((r) => r.id === roomId);
    if (!room) return;
    const dup: Room = {
      ...JSON.parse(JSON.stringify(room)),
      id: uid(),
      name: `${room.name} Copy`,
      items: room.items.map((i) => ({ ...i, id: uid() })),
    };
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: [...q.rooms, dup],
      activity: [
        ...q.activity,
        {
          id: uid(),
          action: 'Room duplicated',
          date: new Date().toISOString().slice(0, 10),
          note: room.name,
        },
      ],
    }));
  };

  const addItemToRoom = (category: string, itemName: string) => {
    const source = selectedProfile.catalogue[category]?.find(
      (i) => i.name === itemName
    );
    if (!source) return;
    const item: QuoteItem = {
      id: uid(),
      included: true,
      category,
      name: source.name,
      quantity: 1,
      labour: source.labour,
      materials: source.materials,
      complexity: 'New Install',
      spec: 'Standard',
      notes: '',
    };
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: q.rooms.map((r) =>
        r.id === selectedRoomId ? { ...r, items: [...r.items, item] } : r
      ),
    }));
  };

  const addCustomItemToRoom = () => {
    const item: QuoteItem = {
      id: uid(),
      included: true,
      category: 'Other',
      name: 'Custom Item',
      quantity: 1,
      labour: 0,
      materials: 0,
      complexity: 'New Install',
      spec: 'Standard',
      notes: '',
    };
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: q.rooms.map((r) =>
        r.id === selectedRoomId ? { ...r, items: [...r.items, item] } : r
      ),
    }));
  };

  const updateRoom = (roomId: string, patch: Partial<Room>) => {
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: q.rooms.map((r) => (r.id === roomId ? { ...r, ...patch } : r)),
    }));
  };

  const updateItem = (roomId: string, itemId: string, patch: Partial<QuoteItem>) => {
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: q.rooms.map((r) =>
        r.id === roomId
          ? { ...r, items: r.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) }
          : r
      ),
    }));
  };

  const removeItem = (roomId: string, itemId: string) => {
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      rooms: q.rooms.map((r) =>
        r.id === roomId
          ? { ...r, items: r.items.filter((i) => i.id !== itemId) }
          : r
      ),
    }));
  };

  const createPricingItem = (category: string) => {
    const newItem = { id: uid(), name: `New ${category} Item`, labour: 0, materials: 0 };
    setPricingProfiles((prev) =>
      prev.map((p) =>
        p.id === selectedProfile.id
          ? {
              ...p,
              catalogue: {
                ...p.catalogue,
                [category]: [...p.catalogue[category], newItem],
              },
            }
          : p
      )
    );
  };

  const updateCatalogueItem = (
    profileId: string,
    category: string,
    itemId: string,
    patch: Partial<{ name: string; labour: number; materials: number }>
  ) => {
    setPricingProfiles((prev) =>
      prev.map((p) =>
        p.id === profileId
          ? {
              ...p,
              catalogue: {
                ...p.catalogue,
                [category]: p.catalogue[category].map((i) =>
                  i.id === itemId ? { ...i, ...patch } : i
                ),
              },
            }
          : p
      )
    );
  };

  const addPricingProfile = () => {
    const profile: PricingProfile = {
      id: uid(),
      name: `Profile ${pricingProfiles.length + 1}`,
      vatRate: 0.2,
      marginPct: 25,
      complexityMultipliers: { 'New Install': 1.0, Modification: 1.35 },
      specMultipliers: { Standard: 1.0, Premium: 1.2 },
      catalogue: JSON.parse(JSON.stringify(DEFAULT_ITEMS)),
    };
    setPricingProfiles((prev) => [profile, ...prev]);
  };

  const setQuoteStatus = (status: Quote['status']) => {
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      status,
      activity: [
        ...q.activity,
        {
          id: uid(),
          action: `Status set to ${status}`,
          date: new Date().toISOString().slice(0, 10),
          note: '',
        },
      ],
    }));
  };

  const duplicateQuote = () => {
    const source = selectedQuote;
    const cloned: Quote = JSON.parse(JSON.stringify(source));
    cloned.id = uid();
    cloned.quoteNumber = `${company.quotePrefix}-${company.nextQuoteNumber}`;
    cloned.title = `${source.title} Copy`;
    cloned.createdAt = new Date().toISOString().slice(0, 10);
    cloned.status = 'Draft';
    cloned.activity = [
      {
        id: uid(),
        action: 'Quote duplicated',
        date: new Date().toISOString().slice(0, 10),
        note: source.quoteNumber,
      },
    ];
    cloned.rooms = cloned.rooms.map((r) => ({
      ...r,
      id: uid(),
      items: r.items.map((i) => ({ ...i, id: uid() })),
    }));
    setQuotes((prev) => [cloned, ...prev]);
    setSelectedQuoteId(cloned.id);
    setSelectedRoomId(cloned.rooms[0]?.id);
    setCompany((prev) => ({ ...prev, nextQuoteNumber: prev.nextQuoteNumber + 1 }));
  };

  const reviseQuote = () => {
    const source = selectedQuote;
    const currentRevLetter = source.revision
      ? source.revision.replace('Rev ', '')
      : '@';
    const nextRev = String.fromCharCode(currentRevLetter.charCodeAt(0) + 1);
    updateQuote(selectedQuote.id, (q) => ({
      ...q,
      revision: `Rev ${nextRev}`,
      activity: [
        ...q.activity,
        {
          id: uid(),
          action: 'Quote revised',
          date: new Date().toISOString().slice(0, 10),
          note: `Rev ${nextRev}`,
        },
      ],
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Quote Builder Pro</Text>
        <Text style={styles.topSub}>Electrician quotation workflow prototype</Text>
      </View>

      <TabBar activeTab={tab} onTabPress={setTab} />

      <ScrollView contentContainerStyle={styles.content}>
        {tab === 'Home' && (
          <HomeScreen
            dashboardStats={dashboardStats}
            totalByClient={totalByClient}
            addQuote={addQuote}
            addClient={addClient}
          />
        )}

        {tab === 'Quotes' && selectedQuote && (
          <QuotesScreen
            quotes={quotes}
            clients={clients}
            selectedQuote={selectedQuote}
            selectedQuoteId={selectedQuoteId}
            setSelectedQuoteId={setSelectedQuoteId}
            selectedRoom={selectedRoom}
            selectedRoomId={selectedRoomId}
            setSelectedRoomId={setSelectedRoomId}
            selectedProfile={selectedProfile}
            selectedClient={selectedClient}
            selectedTotals={selectedTotals}
            quoteViewMode={quoteViewMode}
            setQuoteViewMode={setQuoteViewMode}
            totalsForQuote={calcTotals}
            addQuote={addQuote}
            updateQuote={updateQuote}
            addRoom={addRoom}
            duplicateRoom={duplicateRoom}
            addItemToRoom={addItemToRoom}
            addCustomItemToRoom={addCustomItemToRoom}
            updateRoom={updateRoom}
            updateItem={updateItem}
            removeItem={removeItem}
            setQuoteStatus={setQuoteStatus}
            duplicateQuote={duplicateQuote}
            reviseQuote={reviseQuote}
            company={company}
          />
        )}

        {tab === 'Clients' && (
          <ClientsScreen
            clients={clients}
            setClients={setClients}
            pricingProfiles={pricingProfiles}
            addClient={addClient}
          />
        )}

        {tab === 'Pricing' && selectedProfile && (
          <PricingScreen
            pricingProfiles={pricingProfiles}
            setPricingProfiles={setPricingProfiles}
            addPricingProfile={addPricingProfile}
            createPricingItem={createPricingItem}
            updateCatalogueItem={updateCatalogueItem}
          />
        )}

        {tab === 'Reports' && (
          <ReportsScreen
            quotes={quotes}
            clients={clients}
            totalsForQuote={calcTotals}
          />
        )}

        {tab === 'Settings' && (
          <SettingsScreen company={company} setCompany={setCompany} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
