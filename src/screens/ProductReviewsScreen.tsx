import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useProduct } from '@/hooks/useProduct';
import { useCanReview, useCreateReview, useProductReviews } from '@/hooks/useReviews';
import { usePickImage } from '@/hooks/usePickImage';
import { useSession } from '@/session/session';
import { uploadImage, type LocalImage } from '@/services/uploads';
import { Button, ErrorState, Loading } from '@/components/ui';
import { AnimatedListItem } from '@/components/motion';
import { StarsDisplay, StarsInput } from '@/components/Stars';
import type { RootStackParamList } from '@/navigation';
import { ApiError, type CanReviewReason, type Review } from '@/types/api';
import { colors } from '@/theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductReviews'>;

/**
 * Texto próprio por motivo de recusa (RF-37).
 *
 * A API devolve um `message` pronto, mas o requisito pede que o app trate cada
 * motivo — então os textos daqui têm precedência, e o `message` da API é o
 * fallback para um motivo que ainda não conhecemos.
 */
const REASON_TEXT: Record<string, { title: string; body: string }> = {
  NOT_PURCHASED: {
    title: 'Só quem comprou pode avaliar',
    body: 'A avaliação libera depois que um pedido com este produto for pago. Se você acabou de fechar o pedido, confira se o pagamento foi concluído.',
  },
  ALREADY_REVIEWED: {
    title: 'Você já avaliou este produto',
    body: 'Sua avaliação aparece na lista abaixo, marcada como sua.',
  },
};

export function ProductReviewsScreen({ route, navigation }: Props) {
  const { productId } = route.params;
  const { isAuthenticated } = useSession();

  // A média vem do próprio produto (RF-35): nenhuma requisição extra, e nenhuma
  // conta feita no app em cima da lista — que é paginada e daria número errado.
  const { data: product } = useProduct(productId);
  const reviews = useProductReviews(productId);
  const canReview = useCanReview(productId);
  const createReview = useCreateReview(productId);
  const gallery = usePickImage();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photo, setPhoto] = useState<LocalImage | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  async function handlePickPhoto() {
    setFormError(null);
    const image = await gallery.pick();
    if (image) setPhoto(image);
  }

  async function handleSubmit() {
    // Validação antes do envio (RF-38).
    if (rating < 1) {
      setFormError('Escolha uma nota de 1 a 5 estrelas.');
      return;
    }
    const trimmed = comment.trim();
    if (trimmed.length > 0 && trimmed.length < 10) {
      setFormError('O comentário está muito curto. Escreva pelo menos 10 caracteres ou deixe em branco.');
      return;
    }

    setFormError(null);
    setIsSending(true);
    try {
      let mediaIds: string[] | undefined;

      if (photo) {
        try {
          const media = await uploadImage(photo);
          // Atenção: o id do media chama-se `id`, não `mediaId` (ver types/api.ts).
          mediaIds = [media.id];
        } catch {
          // A foto falhar não pode custar o texto já escrito: avisa e deixa a
          // pessoa remover a foto e enviar mesmo assim.
          setFormError('Não consegui enviar a foto. Tente outra imagem, ou remova a foto e envie só o texto.');
          return;
        }
      }

      await createReview.mutateAsync({
        rating,
        comment: trimmed || undefined,
        mediaIds,
      });

      // A lista e a média se atualizam sozinhas pela invalidação feita no hook
      // (RF-41) — aqui só limpamos o formulário.
      setRating(0);
      setComment('');
      setPhoto(null);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Não foi possível enviar sua avaliação.');
    } finally {
      setIsSending(false);
    }
  }

  const summary = product?.rating;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* ---------- Média e contagem, vindas do produto (RF-35) ---------- */}
      <View style={styles.summaryCard}>
        {summary && summary.count > 0 ? (
          <>
            <Text style={styles.average}>{summary.average.toFixed(1)}</Text>
            <StarsDisplay value={summary.average} size={20} />
            <Text style={styles.count}>
              {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'}
            </Text>
          </>
        ) : (
          <>
            <StarsDisplay value={0} size={20} />
            <Text style={styles.count}>Ainda sem avaliações</Text>
          </>
        )}
      </View>

      {/* ---------- Formulário, com o portão do can-review (RF-37) ---------- */}
      <ReviewGate
        isAuthenticated={isAuthenticated}
        isChecking={canReview.isLoading}
        canReview={canReview.data?.canReview ?? false}
        reason={canReview.data?.reason ?? null}
        apiMessage={canReview.data?.message}
        onLogin={() => navigation.navigate('Login')}
      >
        <View style={styles.form}>
          <Text style={styles.formTitle}>Deixe sua avaliação</Text>

          <Text style={styles.label}>Sua nota</Text>
          <StarsInput value={rating} onChange={setRating} />

          <Text style={styles.label}>Comentário (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Conte como foi sua experiência com o produto…"
            placeholderTextColor={colors.gray}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            maxLength={2000}
            textAlignVertical="top"
          />

          {/* ---------- Foto, e a degradação da galeria (RF-39 e RF-40) ---------- */}
          {photo ? (
            <View style={styles.photoRow}>
              <Image source={{ uri: photo.uri }} style={styles.photoThumb} />
              <Button label="Remover foto" variant="ghost" onPress={() => setPhoto(null)} />
            </View>
          ) : (
            <Button label="Anexar foto da galeria" variant="ghost" onPress={handlePickPhoto} />
          )}

          {gallery.permission === 'denied' && !photo && (
            <View style={styles.notice}>
              <Ionicons name="images-outline" size={18} color={colors.gray} />
              <Text style={styles.noticeText}>
                Sem acesso à galeria, sua avaliação vai sem foto — o texto e a nota continuam
                valendo normalmente. Toque em “Anexar foto” de novo para permitir o acesso.
              </Text>
            </View>
          )}

          {gallery.permission === 'blocked' && !photo && (
            <View style={styles.notice}>
              <Ionicons name="settings-outline" size={18} color={colors.gray} />
              <Text style={styles.noticeText}>
                O acesso à galeria está bloqueado nas configurações do aparelho, então não dá para
                anexar foto por aqui. Sua avaliação continua podendo ser enviada com nota e texto.
              </Text>
              <Button label="Abrir configurações" variant="ghost" onPress={gallery.openSettings} />
            </View>
          )}

          {formError && <Text style={styles.error}>{formError}</Text>}

          <Button
            label={isSending ? 'Enviando…' : 'Enviar avaliação'}
            onPress={handleSubmit}
            disabled={isSending}
          />
        </View>
      </ReviewGate>

      {/* ---------- A lista, com os quatro estados (RF-36) ---------- */}
      <Text style={styles.sectionTitle}>Avaliações</Text>

      {reviews.isLoading ? (
        <Loading label="Carregando avaliações…" />
      ) : reviews.isError ? (
        <ErrorState
          message={reviews.error instanceof ApiError ? reviews.error.message : 'Falha ao carregar.'}
          onRetry={() => reviews.refetch()}
        />
      ) : !reviews.data || reviews.data.data.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubble-ellipses-outline" size={44} color={colors.gray} />
          <Text style={styles.emptyTitle}>Nenhuma avaliação ainda</Text>
          <Text style={styles.emptyBody}>Quem comprou este produto pode ser o primeiro a avaliar.</Text>
        </View>
      ) : (
        reviews.data.data.map((review, index) => (
          <AnimatedListItem key={review.id} index={index}>
            <ReviewCard review={review} />
          </AnimatedListItem>
        ))
      )}
    </ScrollView>
  );
}

/**
 * Decide entre formulário, convite para entrar, ou a explicação do motivo da
 * recusa. Separado da tela para a regra do RF-37 caber de uma olhada.
 */
function ReviewGate({
  isAuthenticated,
  isChecking,
  canReview,
  reason,
  apiMessage,
  onLogin,
  children,
}: {
  isAuthenticated: boolean;
  isChecking: boolean;
  canReview: boolean;
  reason: CanReviewReason | null;
  apiMessage?: string;
  onLogin: () => void;
  children: React.ReactNode;
}) {
  if (!isAuthenticated) {
    return (
      <View style={styles.gate}>
        <Text style={styles.gateTitle}>Entre para avaliar</Text>
        <Text style={styles.gateBody}>
          Só clientes com pedido pago deste produto podem avaliar.
        </Text>
        <Button label="Entrar" onPress={onLogin} />
      </View>
    );
  }

  if (isChecking) {
    return (
      <View style={styles.gate}>
        <Loading label="Verificando se você pode avaliar…" />
      </View>
    );
  }

  if (canReview) return <>{children}</>;

  const known = reason ? REASON_TEXT[reason] : undefined;

  return (
    <View style={styles.gate}>
      <Text style={styles.gateTitle}>{known?.title ?? 'Avaliação indisponível'}</Text>
      <Text style={styles.gateBody}>
        {known?.body ?? apiMessage ?? 'Não é possível avaliar este produto agora.'}
      </Text>
    </View>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={[styles.card, review.isMine && styles.cardMine]}>
      <View style={styles.cardHeader}>
        <View style={styles.cardAuthor}>
          <Text style={styles.authorName}>{review.author.name}</Text>
          {review.verifiedPurchase && (
            <View style={styles.verified}>
              <Ionicons name="checkmark-circle" size={13} color={colors.accent} />
              <Text style={styles.verifiedText}>Compra verificada</Text>
            </View>
          )}
        </View>
        {review.isMine && <Text style={styles.mineTag}>Sua</Text>}
      </View>

      <StarsDisplay value={review.rating} />

      {review.title && <Text style={styles.cardTitle}>{review.title}</Text>}
      {review.comment && <Text style={styles.cardComment}>{review.comment}</Text>}

      {review.images.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cardImages}>
          {review.images.map((image) => (
            <Image key={image.id} source={{ uri: image.url }} style={styles.cardImage} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 14, backgroundColor: colors.white },

  summaryCard: {
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.grayLight,
    borderRadius: 14,
    paddingVertical: 18,
  },
  average: { fontSize: 36, fontWeight: '800', color: colors.black },
  count: { fontSize: 13, color: colors.gray },

  gate: { backgroundColor: colors.grayLight, borderRadius: 14, padding: 16, gap: 8 },
  gateTitle: { fontSize: 15, fontWeight: '700', color: colors.black },
  gateBody: { fontSize: 13, color: colors.gray, lineHeight: 19 },

  form: { backgroundColor: colors.grayLight, borderRadius: 14, padding: 16, gap: 10 },
  formTitle: { fontSize: 15, fontWeight: '700', color: colors.black },
  label: { fontSize: 13, fontWeight: '600', color: colors.gray, marginTop: 4 },
  input: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    minHeight: 92,
    color: colors.black,
  },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  photoThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: colors.border },
  notice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    flexWrap: 'wrap',
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.gray, lineHeight: 18 },
  error: { fontSize: 13, color: colors.danger },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.black, marginTop: 6 },

  empty: { alignItems: 'center', gap: 6, paddingVertical: 28 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.black },
  emptyBody: { fontSize: 13, color: colors.gray, textAlign: 'center' },

  card: {
    backgroundColor: colors.grayLight,
    borderRadius: 12,
    padding: 12,
    gap: 6,
    marginBottom: 10,
  },
  cardMine: { borderWidth: 1, borderColor: colors.accent },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardAuthor: { gap: 2 },
  authorName: { fontSize: 14, fontWeight: '700', color: colors.black },
  verified: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  verifiedText: { fontSize: 11, color: colors.accent, fontWeight: '600' },
  mineTag: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.accent,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
  },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.black },
  cardComment: { fontSize: 13, color: colors.black, lineHeight: 19 },
  cardImages: { marginTop: 4 },
  cardImage: { width: 88, height: 88, borderRadius: 10, marginRight: 8, backgroundColor: colors.border },
});
