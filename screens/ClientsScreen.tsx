import React from 'react';
import { View } from 'react-native';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import ChipRow from '../components/ui/ChipRow';
import styles from '../styles/styles';
import { Client, PricingProfile } from '../types';

interface ClientsScreenProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  pricingProfiles: PricingProfile[];
  addClient: () => void;
}

export default function ClientsScreen({
  clients,
  setClients,
  pricingProfiles,
  addClient,
}: ClientsScreenProps) {
  return (
    <Card title="Clients">
      <Button text="Add Client" onPress={addClient} />
      {clients.map((client) => (
        <View key={client.id} style={styles.itemCard}>
          <Label text="Client Name" />
          <Input
            value={client.clientName}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, clientName: v } : c))
              )
            }
          />

          <Label text="Company Name" />
          <Input
            value={client.companyName}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, companyName: v } : c))
              )
            }
          />

          <Label text="Billing Address" />
          <Input
            multiline
            value={client.billingAddress}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, billingAddress: v } : c))
              )
            }
          />

          <Label text="Site Address" />
          <Input
            multiline
            value={client.siteAddress}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, siteAddress: v } : c))
              )
            }
          />

          <Label text="Contact Name" />
          <Input
            value={client.contactName}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, contactName: v } : c))
              )
            }
          />

          <Label text="Phone" />
          <Input
            value={client.contactPhone}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, contactPhone: v } : c))
              )
            }
          />

          <Label text="Email" />
          <Input
            value={client.contactEmail}
            onChangeText={(v) =>
              setClients((prev) =>
                prev.map((c) => (c.id === client.id ? { ...c, contactEmail: v } : c))
              )
            }
          />

          <Label text="Pricing Profile" />
          <ChipRow
            options={pricingProfiles.map((p) => ({ key: p.id, label: p.name }))}
            selected={client.pricingProfileId}
            onSelect={(v) =>
              setClients((prev) =>
                prev.map((c) =>
                  c.id === client.id ? { ...c, pricingProfileId: v } : c
                )
              )
            }
          />
        </View>
      ))}
    </Card>
  );
}
