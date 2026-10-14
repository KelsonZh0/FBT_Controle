import { useReducedMotion, type WithSpringConfig, type WithTimingConfig } from 'react-native-reanimated';

/**
 * O movimento também é identidade (RF-62): durações, molas e atrasos vivem só
 * aqui. Nenhum componente inventa número próprio — se precisar de um timing
 * novo, ele entra nesta tabela antes de ser usado.
 */

/**
 * Chave geral das animações (RF-55). Trocar para `false` desliga todo o
 * movimento do app de uma vez, sem remover o feedback: os componentes caem no
 * estado estático equivalente (opacidade, texto, indicador parado).
 * Serve para depurar layout e para provar que o app continua usável sem anima­ção.
 */
export const ANIMATIONS_ENABLED = true;

/** Durações em ms. `instant` é o valor usado quando o movimento está desligado. */
export const durations = {
  instant: 0,
  fast: 140,
  base: 220,
  slow: 320,
} as const;

/**
 * Molas. `press` é curta e firme porque responde ao dedo; `entrance` é mais
 * solta porque acompanha conteúdo chegando; `layout` acomoda vizinhos quando
 * um item sai da lista.
 */
export const springs = {
  press: { damping: 18, stiffness: 320, mass: 0.6 },
  entrance: { damping: 20, stiffness: 180, mass: 0.8 },
  layout: { damping: 22, stiffness: 200, mass: 0.9 },
} satisfies Record<string, WithSpringConfig>;

export const timings = {
  fade: { duration: durations.base },
  quick: { duration: durations.fast },
} satisfies Record<string, WithTimingConfig>;

/**
 * Entrada escalonada da lista (RF-51). O teto existe para o 40º item não
 * esperar dois segundos para aparecer: a partir de `max` todo mundo entra junto.
 */
export const stagger = {
  step: 45,
  max: 300,
} as const;

/** Quanto um controle encolhe ao ser pressionado. */
export const pressScale = 0.96;

/**
 * Única fonte de verdade sobre "pode animar agora?" (RF-54 + RF-55).
 *
 * Combina a chave do app com o "Reduzir movimento" do sistema operacional.
 * Quem chama isto deve *substituir* o movimento por um feedback estático
 * quando o retorno for `false` — nunca simplesmente remover o feedback.
 */
export function useMotionEnabled(): boolean {
  const prefersReducedMotion = useReducedMotion();
  return ANIMATIONS_ENABLED && !prefersReducedMotion;
}
