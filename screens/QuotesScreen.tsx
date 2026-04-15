import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import ChipRow from '../components/ui/ChipRow';
import DocumentPreview from '../components/previews/DocumentPreview';
import BreakdownPreview from '../components/previews/BreakdownPreview';
import InternalPreview from '../components/previews/InternalPreview';
import money from '../utils/money';
import styles from '../styles/styles';
import {
  Quote,
  Client,
  PricingProfile,
  Room,
  QuoteItem,
  QuoteTotals,
  Company,
} from '../types';

type QuoteViewMode = 'Client Quote' | 'Breakdown' | 'Internal';

interface QuotesScreenProps {
  quotes: Quote[];
  clients: Client[];
  selectedQuote: Quote;
  selectedQuoteId: string;
  setSelectedQuoteId: (id: string) => void;
  selectedRoom: Room | undefined;
  selectedRoomId: string;
  setSelectedRoomId: (id: string) => void;
  selectedProfile: PricingProfile;
  selectedClient: Client | undefined;
  selectedTotals: QuoteTotals | null;
  quoteViewMode: QuoteViewMode;
  setQuoteViewMode: (mode: QuoteViewMode) => void;
  totalsForQuote: (quote: Quote) => QuoteTotals;
  addQuote: () => void;
  updateQuote: (quoteId: string, updater: (q: Quote) => Quote) => void;
  addRoom: () => void;
  duplicateRoom: (roomId: string) => void;
  addItemToRoom: (category: string, itemName: string) => void;
  addCustomItemToRoom: () => void;
  updateRoom: (roomId: string, patch: Partial<Room>) => void;
  updateItem: (roomId: string, itemId: string, patch: Partial<QuoteItem>) => void;
  removeItem: (roomId: string, itemId: string) => void;
  setQuoteStatus: (status: Quote['status']) => void;
  duplicateQuote: () => void;
  reviseQuote: () => void;
  company: Company;
}

export default function QuotesScreen({
  quotes,
  clients,
  selectedQuote,
  selectedQuoteId,
  setSelectedQuoteId,
  selectedRoom,
  selectedRoomId,
  setSelectedRoomId,
  selectedProfile,
  selectedClient,
  selectedTotals,
  quoteViewMode,
  setQuoteViewMode,
  totalsForQuote,
  addQuote,
  updateQuote,
  addRoom,
  duplicateRoom,
  addItemToRoom,
  addCustomItemToRoom,
  updateRoom,
  updateItem,
  removeItem,
  setQuoteStatus,
  duplicateQuote,
  reviseQuote,
  company,
}: QuotesScreenProps) {
  return (
    <>
      <Card title="Quotes List">
        <Button text="Create New Quote" onPress={addQuote} />
        {quotes.map((q) => {
          const client = clients.find((c) => c.id === q.clientId);
          const totals = totalsForQuote(q);
          return (
            <TouchableOpacity
              key={q.id}
              style={[styles.listRow, q.id === selectedQuoteId && styles.selectedRow]}
              onPress={() => {
                setSelectedQuoteId(q.id);
                setSelectedRoomId(q.rooms[0]?.id);
              }}
            >
              <Text style={styles.listTitle}>
                {q.quoteNumber} • {q.title}
              </Text>
              <Text style={styles.listMeta}>
                {client?.clientName || 'No client'} • {q.status} •{' '}
                {money(totals.total)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </Card>

      <Card title="Quote Header">
        <Label text="Quote Title" />
        <Input
          value={selectedQuote.title}
          onChangeText={(v) =>
            updateQuote(selectedQuote.id, (q) => ({ ...q, title: v }))
          }
        />

        <Label text="Client" />
        <ChipRow
          options={clients.map((c) => ({ key: c.id, label: c.clientName }))}
          selected={selectedQuote.clientId}
          onSelect={(v) =>
            updateQuote(selectedQuote.id, (q) => ({ ...q, clientId: v }))
          }
        />

        <Label text="Quote Description" />
        <Input
          multiline
          value={selectedQuote.description}
          onChangeText={(v) =>
            updateQuote(selectedQuote.id, (q) => ({ ...q, description: v }))
          }
        />

        <Label text="Exclusions" />
        <Input
          multiline
          value={selectedQuote.exclusions}
          onChangeText={(v) =>
            updateQuote(selectedQuote.id, (q) => ({ ...q, exclusions: v }))
          }
        />
      </Card>

      <Card title="Workflow Actions">
        <ChipRow
          options={(['Draft', 'Sent', 'Accepted', 'Rejected', 'On Hold'] as Quote['status'][]).map(
            (s) => ({ key: s, label: s })
          )}
          selected={selectedQuote.status}
          onSelect={(v) => setQuoteStatus(v as Quote['status'])}
        />
        <Button text="Duplicate Quote" onPress={duplicateQuote} />
        <Button text="Revise Quote" onPress={reviseQuote} />
      </Card>

      <Card title="Rooms">
        <Button text="Add Room" onPress={addRoom} />
        {selectedQuote.rooms.map((room) => (
          <TouchableOpacity
            key={room.id}
            style={[styles.roomCard, room.id === selectedRoomId && styles.selectedRow]}
            onPress={() => setSelectedRoomId(room.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{room.name}</Text>
              <Text style={styles.listMeta}>
                {room.included ? 'Included' : 'Excluded'} • {room.items.length} item(s)
              </Text>
            </View>
            <TouchableOpacity
              style={styles.smallAction}
              onPress={() => duplicateRoom(room.id)}
            >
              <Text style={styles.smallActionText}>Duplicate</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </Card>

      {selectedRoom && (
        <Card title={`Edit ${selectedRoom.name}`}>
          <Label text="Room Name" />
          <Input
            value={selectedRoom.name}
            onChangeText={(v) => updateRoom(selectedRoom.id, { name: v })}
          />

          <Label text="Room Description" />
          <Input
            multiline
            value={selectedRoom.description}
            onChangeText={(v) => updateRoom(selectedRoom.id, { description: v })}
          />

          <TouchableOpacity
            style={[styles.toggle, selectedRoom.included && styles.toggleActive]}
            onPress={() =>
              updateRoom(selectedRoom.id, { included: !selectedRoom.included })
            }
          >
            <Text style={styles.toggleText}>
              {selectedRoom.included ? 'Included in quote' : 'Excluded from quote'}
            </Text>
          </TouchableOpacity>

          <Label text="Add From Saved Pricing" />
          {Object.keys(selectedProfile.catalogue).map((category) => (
            <View key={category} style={{ marginBottom: 10 }}>
              <Text style={styles.groupTitle}>{category}</Text>
              <ChipRow
                options={selectedProfile.catalogue[category].map((i) => ({
                  key: i.name,
                  label: i.name,
                }))}
                selected={null}
                onSelect={(name) => addItemToRoom(category, name)}
              />
            </View>
          ))}

          <Button text="Add Custom Item" onPress={addCustomItemToRoom} />

          {selectedRoom.items.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.rowBetween}>
                <Text style={styles.listTitle}>{item.name}</Text>
                <TouchableOpacity
                  style={styles.smallDanger}
                  onPress={() => removeItem(selectedRoom.id, item.id)}
                >
                  <Text style={styles.smallDangerText}>Delete</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.toggle, item.included && styles.toggleActive]}
                onPress={() =>
                  updateItem(selectedRoom.id, item.id, { included: !item.included })
                }
              >
                <Text style={styles.toggleText}>
                  {item.included ? 'Included' : 'Omitted'}
                </Text>
              </TouchableOpacity>

              <Label text="Item Name" />
              <Input
                value={item.name}
                onChangeText={(v) =>
                  updateItem(selectedRoom.id, item.id, { name: v })
                }
              />

              <Label text="Category" />
              <ChipRow
                options={['Power', 'Lighting', 'Other'].map((x) => ({
                  key: x,
                  label: x,
                }))}
                selected={item.category}
                onSelect={(v) => updateItem(selectedRoom.id, item.id, { category: v })}
              />

              <Label text="Quantity" />
              <Input
                value={String(item.quantity)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  updateItem(selectedRoom.id, item.id, { quantity: Number(v) || 0 })
                }
              />

              <Label text="Labour" />
              <Input
                value={String(item.labour)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  updateItem(selectedRoom.id, item.id, { labour: Number(v) || 0 })
                }
              />

              <Label text="Materials" />
              <Input
                value={String(item.materials)}
                keyboardType="numeric"
                onChangeText={(v) =>
                  updateItem(selectedRoom.id, item.id, { materials: Number(v) || 0 })
                }
              />

              <Label text="Complexity" />
              <ChipRow
                options={Object.keys(selectedProfile.complexityMultipliers).map(
                  (x) => ({ key: x, label: x })
                )}
                selected={item.complexity}
                onSelect={(v) =>
                  updateItem(selectedRoom.id, item.id, { complexity: v })
                }
              />

              <Label text="Specification" />
              <ChipRow
                options={Object.keys(selectedProfile.specMultipliers).map((x) => ({
                  key: x,
                  label: x,
                }))}
                selected={item.spec}
                onSelect={(v) => updateItem(selectedRoom.id, item.id, { spec: v })}
              />

              <Label text="Notes" />
              <Input
                multiline
                value={item.notes}
                onChangeText={(v) =>
                  updateItem(selectedRoom.id, item.id, { notes: v })
                }
              />
            </View>
          ))}
        </Card>
      )}

      <Card title="Quote Preview">
        <ChipRow
          options={[
            { key: 'Client Quote', label: 'Client Quote' },
            { key: 'Breakdown', label: 'Breakdown' },
            { key: 'Internal', label: 'Internal' },
          ]}
          selected={quoteViewMode}
          onSelect={(v) => setQuoteViewMode(v as QuoteViewMode)}
        />

        {quoteViewMode === 'Client Quote' && selectedTotals && (
          <DocumentPreview
            company={company}
            quote={selectedQuote}
            client={selectedClient}
            totals={selectedTotals}
          />
        )}

        {quoteViewMode === 'Breakdown' && selectedTotals && (
          <BreakdownPreview
            quote={selectedQuote}
            totals={selectedTotals}
            profile={selectedProfile}
          />
        )}

        {quoteViewMode === 'Internal' && selectedTotals && (
          <InternalPreview totals={selectedTotals} />
        )}
      </Card>

      <Card title="Activity Timeline">
        {selectedQuote.activity
          .slice()
          .reverse()
          .map((a) => (
            <View key={a.id} style={styles.listRow}>
              <Text style={styles.listTitle}>{a.action}</Text>
              <Text style={styles.listMeta}>
                {a.date}
                {a.note ? ` • ${a.note}` : ''}
              </Text>
            </View>
          ))}
      </Card>
    </>
  );
}
