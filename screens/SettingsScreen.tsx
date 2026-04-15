import React from 'react';
import Card from '../components/ui/Card';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import { Company } from '../types';

interface SettingsScreenProps {
  company: Company;
  setCompany: React.Dispatch<React.SetStateAction<Company>>;
}

export default function SettingsScreen({ company, setCompany }: SettingsScreenProps) {
  return (
    <Card title="Company Branding & Defaults">
      <Label text="Company Name" />
      <Input
        value={company.companyName}
        onChangeText={(v) => setCompany((p) => ({ ...p, companyName: v }))}
      />

      <Label text="Address" />
      <Input
        multiline
        value={company.address}
        onChangeText={(v) => setCompany((p) => ({ ...p, address: v }))}
      />

      <Label text="Phone" />
      <Input
        value={company.phone}
        onChangeText={(v) => setCompany((p) => ({ ...p, phone: v }))}
      />

      <Label text="Email" />
      <Input
        value={company.email}
        onChangeText={(v) => setCompany((p) => ({ ...p, email: v }))}
      />

      <Label text="Website" />
      <Input
        value={company.website}
        onChangeText={(v) => setCompany((p) => ({ ...p, website: v }))}
      />

      <Label text="Quote Prefix" />
      <Input
        value={company.quotePrefix}
        onChangeText={(v) => setCompany((p) => ({ ...p, quotePrefix: v }))}
      />

      <Label text="Next Quote Number" />
      <Input
        value={String(company.nextQuoteNumber)}
        keyboardType="numeric"
        onChangeText={(v) =>
          setCompany((p) => ({ ...p, nextQuoteNumber: Number(v) || 1 }))
        }
      />

      <Label text="Default Terms" />
      <Input
        multiline
        value={company.defaultTerms}
        onChangeText={(v) => setCompany((p) => ({ ...p, defaultTerms: v }))}
      />

      <Label text="Default Exclusions" />
      <Input
        multiline
        value={company.defaultExclusions}
        onChangeText={(v) => setCompany((p) => ({ ...p, defaultExclusions: v }))}
      />
    </Card>
  );
}
