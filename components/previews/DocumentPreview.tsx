import React from 'react';
import { View, Text } from 'react-native';
import InfoRow from '../ui/InfoRow';
import money from '../../utils/money';
import styles from '../../styles/styles';
import { Company, Quote, Client, QuoteTotals } from '../../types';

interface DocumentPreviewProps {
  company: Company;
  quote: Quote;
  client: Client | undefined;
  totals: QuoteTotals;
}

export default function DocumentPreview({ company, quote, client, totals }: DocumentPreviewProps) {
  return (
    <View style={styles.docPage}>
      <Text style={styles.docCompany}>{company.companyName}</Text>
      <Text style={styles.docSmall}>{company.address}</Text>
      <Text style={styles.docSmall}>
        {company.phone} • {company.email}
      </Text>
      <View style={styles.docDivider} />
      <Text style={styles.docHeading}>Quotation</Text>
      <Text style={styles.docSmall}>{quote.quoteNumber}</Text>
      <Text style={styles.docSmall}>Date: {quote.createdAt}</Text>

      <Text style={styles.docSection}>Client</Text>
      <Text style={styles.docSmall}>{client?.clientName}</Text>
      {client?.companyName ? (
        <Text style={styles.docSmall}>{client.companyName}</Text>
      ) : null}
      <Text style={styles.docSmall}>{client?.billingAddress}</Text>

      <Text style={styles.docSection}>Site Address</Text>
      <Text style={styles.docSmall}>{client?.siteAddress}</Text>

      <Text style={styles.docSection}>Description of Works</Text>
      <Text style={styles.docBody}>{quote.description}</Text>

      {quote.rooms
        .filter((r) => r.included)
        .map((room) => (
          <View key={room.id} style={{ marginBottom: 8 }}>
            <Text style={styles.docSection}>{room.name}</Text>
            <Text style={styles.docBody}>
              {room.description || 'Electrical works as discussed on site.'}
            </Text>
          </View>
        ))}

      <Text style={styles.docSection}>Exclusions / Assumptions</Text>
      <Text style={styles.docBody}>{quote.exclusions}</Text>

      <View style={styles.docDivider} />
      <InfoRow label="Subtotal" value={money(totals.customerSubtotal)} compact />
      <InfoRow label="VAT" value={money(totals.vat)} compact />
      <InfoRow label="Total" value={money(totals.total)} compact strong />

      <Text style={styles.docSection}>Acceptance</Text>
      <Text style={styles.docBody}>
        We accept this quotation and authorise the works to proceed.
      </Text>
      <Text style={styles.docSmall}>
        Signed: ____________________    Date: ____________________
      </Text>

      <Text style={styles.docSection}>Terms</Text>
      <Text style={styles.docBody}>{company.defaultTerms}</Text>
    </View>
  );
}
