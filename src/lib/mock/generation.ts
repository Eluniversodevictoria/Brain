// MOCK DATA — Content generation. Replace with Claude API after approval.
import type {
  MacroTheme, ContentFormatType, ContentObjective,
  GeneratedContent, ReelContent, CarouselContent, PostContent,
  ContentStrategy, CarouselSlide, ImageTextLength, VisualStyle,
} from '@/types'
import { VISUAL_STYLE_LABELS, FORMAT_KIND } from '@/types'

// ── Dev assertion: catch impossible states at runtime ───────────────
function assertKindConsistency(content: GeneratedContent): void {
  if (process.env.NODE_ENV === 'development') {
    if (content.kind === 'carousel') {
      const c = content as CarouselContent
      if ('script' in c || 'ai_video_prompt' in c || 'hook' in c) {
        console.error('[generation] CarouselContent unexpectedly contains reel fields', c)
      }
      if (c.cover_text !== c.slides[0]?.text) {
        console.warn('[generation] CarouselContent.cover_text does not match slides[0].text')
      }
    }
    if (content.kind === 'reel') {
      const r = content as ReelContent
      if ('slides' in r || 'cover_text' in r) {
        console.error('[generation] ReelContent unexpectedly contains carousel fields', r)
      }
    }
    if (content.kind === 'post') {
      const p = content as PostContent
      if ('script' in p || 'slides' in p) {
        console.error('[generation] PostContent unexpectedly contains reel or carousel fields', p)
      }
    }
  }
}

// ── Shared strategy builder ─────────────────────────────────────────

const OBJECTIVE_LABEL: Record<ContentObjective, string> = {
  grow:       'Alcance — identificación masiva',
  comments:   'Generar comentarios — pregunta que invite a responder',
  saves:      'Guardados — contenido de valor para volver',
  shares:     'Compartidos — contenido que la audiencia quiere enviar a alguien',
  connection: 'Conexión emocional — la audiencia se siente vista',
  authority:  'Autoridad — posicionamiento como referente del tema',
  nurture:    'Nutrir audiencia — profundidad para los que ya siguen',
  presell:    'Preparar para oferta — crear contexto de valor',
  sell:       'Venta — convertir',
}

// ── REEL BASE CONTENT ────────────────────────────────────────────────
// Each theme has a full base (reel_talking format).
// The format adapter then reshapes script / on_screen_text / visual_direction
// for other formats without duplicating all theme text.

type ReelBase = Omit<ReelContent, 'kind' | 'visual_style' | 'visual_style_label'>

// Full REEL_PIECES for all 13 MacroThemes — no theme should fall to DEFAULT_REEL.
const REEL_PIECES: Record<MacroTheme, ReelBase> = {
  merecimiento: {
    strategy: {
      objective: 'Alcance — identificación masiva',
      pain_used: 'No me siento merecedora de lo que llega',
      private_thought: '"Esto no puede ser para mí. En algún momento lo descubren."',
      desire: 'Que el merecimiento sea una experiencia real, no solo un concepto',
      primary_emotion: 'Reconocimiento',
      psychological_mechanism: 'Identificación',
      angle: 'El permiso que nunca te diste para recibir',
    },
    hook: 'Nadie te va a dar lo que tú misma no consideras que mereces.',
    script: 'Y no es metáfora. Es algo que puedes observar.\n\nCuando no te crees merecedora de algo — una oportunidad, un aumento, una relación sana — tu comportamiento cambia antes de que nada externo pase.\n\nDejas de pedir.\nDejas de intentar.\nTe adelantas al rechazo.\n\nY las circunstancias simplemente confirman lo que ya tenías decidido.\n\nNo porque no lo mereces.\nSino porque tú decidiste que no.\n\n¿Qué tienes decidido hoy?',
    on_screen_text: '"Nadie te va a dar\nlo que tú misma\nno consideras\nque mereces."',
    visual_direction: 'Victoria a cámara directa. Luz cálida lateral. Pausa de 2 segundos después de la frase principal. Sin música — solo voz.',
    caption: 'Esto no es motivación — es una observación.\n\nCuando no te crees merecedora, tu comportamiento cambia antes de que algo pase externamente. Y todo confirma lo que ya decidiste.\n\n¿Qué tienes decidido sobre ti misma?\n\n💬 Cuéntame en comentarios.',
    cta: '¿Qué es una cosa que sientes que todavía no te mereces? Escríbelo en comentarios.',
    hashtags: ['merecimiento', 'manifestacion', 'autoestima', 'eluniversodevictoria', 'valorpropio'],
    ai_video_prompt: 'Close-up of a woman speaking confidently to camera, warm golden hour light from the left, minimal background in warm neutral tones, soft cinematic look, natural expressions, intimate framing.',
  },

  dinero: {
    strategy: {
      objective: 'Guardados — contenido para volver',
      pain_used: 'El ahorro como sacrificio moral, no puedo guardar lo que gano',
      private_thought: '"Si lo gasto no soy responsable. Si no lo disfruto, ¿para qué lo trabajo?"',
      desire: 'Una relación con el dinero sin culpa ni ansiedad',
      primary_emotion: 'Alivio',
      psychological_mechanism: 'Confesión → Reencuadre',
      angle: 'La relación emocional con el dinero antes que la estrategia financiera',
    },
    hook: 'Me tomó tiempo darme cuenta de que no quería el dinero — quería el permiso de sentirme segura.',
    script: 'El número en la cuenta no era lo que buscaba.\n\nEra poder decir que sí a algo sin calcular tres veces.\nEra dejar de revisar el saldo antes de pagar.\nEra no sentir ese nudo en el estómago cada fin de mes.\n\nEl dinero era el símbolo. La seguridad era lo real.\n\nCuando lo entendí, también entendí por qué nunca "llegaba de verdad": porque lo que necesitaba resolver no era económico.\n\nEra el permiso de existir sin justificarme.\n\n¿Tú también estás buscando el permiso, no el dinero?',
    on_screen_text: '¿Y si lo que buscas\nno es el dinero\nsino el permiso\nde sentirte segura?',
    visual_direction: 'Reel storytelling. Voz baja al inicio, más segura en la conclusión. Luz íntima. Puede ser con texto en pantalla superpuesto en los puntos clave.',
    caption: 'No era el dinero. Era la seguridad.\n\nY cuando entendí la diferencia, también entendí por qué las estrategias financieras no funcionaban solas.\n\nHabía trabajo emocional primero.\n\n💾 Guarda si esto toca algo.',
    cta: 'Guarda este video para cuando vuelvas a creer que el problema es el dinero.',
    hashtags: ['dinero', 'abundancia', 'relacionconeldinero', 'manifestacion', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking reflectively to camera, warm intimate lighting, soft focus background, thoughtful pauses, cinematic close-up and medium shots alternating.',
  },

  oportunidades: {
    strategy: {
      objective: 'Alcance + comentarios',
      pain_used: 'Pido oportunidades pero no sé cómo recibirlas o reconocerlas cuando llegan',
      private_thought: '"¿Y si ya llegó la oportunidad y yo la dejé pasar sin verla?"',
      desire: 'Saber qué hacer después de manifestar para que la oportunidad pueda llegar',
      primary_emotion: 'Apertura activa',
      psychological_mechanism: 'Instrucción concreta + reencuadre del merecimiento',
      angle: 'La oportunidad llega disfrazada',
    },
    hook: 'Hay oportunidades que no ves porque no crees que son para ti.',
    script: 'A veces pedimos una oportunidad y esperamos que llegue exactamente como la imaginamos. Pero puede aparecer como una conversación, una idea que te da miedo intentar o una puerta que parece demasiado grande para ti.\n\nY ahí es donde entra el merecimiento: no solo en pedir algo bueno, sino en reconocer que también puede ser para ti cuando aparece.\n\nEsta semana, antes de descartar algo, pregúntate: ¿lo estoy rechazando porque no lo quiero… o porque todavía no creo que puedo tenerlo?',
    on_screen_text: '¿Lo descartaste porque no lo quieres\no porque no crees que puedes tenerlo?',
    visual_direction: 'Reel hablado directamente a cámara. Victoria habla despacio, con pausa antes de la pregunta final. Luz cálida.',
    caption: 'La oportunidad que manifestaste no llegará con un cartel que diga "esto es lo que pediste".\n\nLlegará disfrazada.\n\n¿Cuál es la oportunidad que estás manifestando ahora mismo?\n\n💬 Cuéntame en comentarios.',
    cta: 'Comenta: ¿qué oportunidad estás manifestando y en qué etapa estás?',
    hashtags: ['oportunidades', 'manifestacion', 'merecimiento', 'crecimientopersonal', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking directly to camera, warm medium lighting, engaged and open expression, medium framing, thoughtful pace.',
  },

  manifestacion: {
    strategy: {
      objective: 'Comentarios',
      pain_used: 'Lo hago bien pero no funciona — la técnica fallida como defecto personal',
      private_thought: '"Si a otras personas les funciona y a mí no, el problema soy yo."',
      desire: 'Entender por qué no funciona sin convertirlo en evidencia de un defecto',
      primary_emotion: 'Claridad',
      psychological_mechanism: 'Desmitificación + Reencuadre',
      angle: 'Identidad sobre técnica — el error de fondo',
    },
    hook: 'El error más común en la manifestación no es el que crees.',
    script: 'No es que visualices mal.\nNo es que tus afirmaciones estén en tiempo incorrecto.\nNo es que no creas "suficiente".\n\nEl error — desde la perspectiva de la manifestación — es que muchas veces pedimos desde quien queremos ser, no desde quien ya estamos siendo.\n\nCuando pides desde el deseo: hay urgencia. Hay falta.\nCuando actúas desde la identidad: hay confianza. Hay presencia.\n\nUno pide.\nEl otro ya tiene.\n\n¿Desde dónde manifiestas tú?',
    on_screen_text: 'Manifiestas desde el deseo → urgencia\nActúas desde la identidad → confianza',
    visual_direction: 'Reel educativo. Texto en pantalla sincronizado con la voz en puntos clave. Voz clara y directa. Pausa larga antes de la pregunta final.',
    caption: 'El error de la manifestación no es técnico.\n\nEs de identidad.\n\n¿Manifiestas desde quien quieres ser o desde quien ya eres?\n\n💬 Escribe tu respuesta honesta en comentarios.',
    cta: 'Comenta: ¿desde dónde manifiestas tú ahora mismo?',
    hashtags: ['manifestacion', 'leyatraccion', 'crecimientopersonal', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman explaining an idea directly to camera, clear and confident delivery, text overlays for key contrasts, warm studio lighting, medium shots.',
  },

  creencias: {
    strategy: {
      objective: 'Guardados',
      pain_used: 'Yo no soy de las que tienen eso — identidad de clase y merecimiento',
      private_thought: '"Eso no es para gente como yo. En mi familia siempre fue difícil."',
      desire: 'Entender de dónde vienen las creencias para poder examinarlas',
      primary_emotion: 'Claridad',
      psychological_mechanism: 'Señal de identidad → Revelación de origen',
      angle: 'Las creencias sobre el dinero que heredaste sin elegirlas',
    },
    hook: 'Si te has dicho "yo no soy de las que tienen eso" — vale la pena revisar de dónde viene esa frase.',
    script: '¿De dónde vino esa frase?\n\nNo la inventaste tú. La absorbiste.\n\nDe la forma en que tu familia hablaba del dinero.\nDel tono en que se decía "ese es rico" — como si rico fuera sospechoso.\nDel mensaje implícito de que pedir demasiado era de mal gusto.\nDe ver que quien sobresalía pagaba un costo social.\n\nNunca fue una decisión consciente.\nFue una herencia.\n\nY como toda herencia: puedes examinarla, quedarte con lo que funciona y devolver el resto.',
    on_screen_text: '"Yo no soy de las que tienen eso"\n\n¿De dónde vino esa frase?',
    visual_direction: 'Reel educativo. Texto en pantalla en los puntos de origen. Victoria habla de forma reflexiva, como alguien que ya hizo este trabajo.',
    caption: 'Esa frase que tienes tan normalizada no la elegiste.\n\nLa heredaste.\n\nY se puede examinar. Se puede devolver.\n\n💾 Guarda esto para cuando vuelva a aparecer.',
    cta: 'Guarda esto para cuando la voz interna vuelva a decirte que no eres "de las que tienen eso".',
    hashtags: ['creencias', 'abundancia', 'dinero', 'autoconocimiento', 'eluniversodevictoria'],
    ai_video_prompt: 'Close-up portrait, woman with knowing expression, warm natural light, minimal styling, intimate camera distance, reflective mood.',
  },

  abundancia: {
    strategy: {
      objective: 'Guardados — práctica para volver',
      pain_used: 'La abundancia es para después de algo — siempre hay algo que resolver primero',
      private_thought: '"Cuando X esté resuelto, entonces sí podré sentirme abundante."',
      desire: 'Experimentar la abundancia ahora, no como meta futura',
      primary_emotion: 'Apertura',
      psychological_mechanism: 'Scripting guiado + permiso de recibir',
      angle: 'Scripting de abundancia en presente',
    },
    hook: 'Escribe esto exactamente como te lo dicto — y date permiso de creértelo mientras escribes.',
    script: 'Abre una nota o un papel.\n\nEscribe:\n\n"El dinero llega a mí de formas que todavía no puedo imaginar."\n\nRespira.\n\n"Estoy abierta a recibir prosperidad en todas sus formas."\n\nRespira.\n\n"Me permito recibir sin tener que justificarlo."\n\nEl scripting no es para el momento en que ya lo crees. Es para el momento en que estás aprendiendo a creerlo.\n\nY practicarlo también es una forma de manifestar.',
    on_screen_text: '"El dinero llega a mí\nde formas que todavía\nno puedo imaginar."',
    visual_direction: 'Reel guiado. Victoria habla despacio, con pausa entre frases. Subtítulos con las frases de scripting en pantalla. Música suave de fondo. Sin prisa.',
    caption: 'Sesión de scripting de abundancia.\n\nNo hace falta creértelo al 100% todavía.\nHace falta escribirlo como práctica.\n\n¿Qué frase te resonó? Cuéntame en comentarios.\n\n💾 Guarda para la próxima vez que quieras poner una intención.',
    cta: 'Guarda para tu próxima práctica de scripting de abundancia.',
    hashtags: ['abundancia', 'scripting', 'manifestacion', 'afirmaciones', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking slowly and deliberately to camera, scripting phrases appearing as text overlays with pauses, soft golden light, calm peaceful atmosphere.',
  },

  desapego: {
    strategy: {
      objective: 'Guardados',
      pain_used: 'Creo que soltar significa que ya no me importa — o que me rendí',
      private_thought: '"Si lo suelto, estoy dando señal de que no lo quiero. Y sí lo quiero."',
      desire: 'Una manera de manifestar que no dependa del control',
      primary_emotion: 'Alivio y claridad',
      psychological_mechanism: 'Reencuadre semántico + liberación de tensión',
      angle: 'Soltar el control, no el deseo',
    },
    hook: '¿Y si soltar no significa que ya no te importa? ¿Y si es exactamente lo contrario?',
    script: 'Desapego no es indiferencia.\n\nNo es decir "me da igual" cuando sí te importa.\nNo es fingir que no lo quieres.\n\nDesapego — en la práctica de la manifestación — es decir: lo quiero, confío en que va a llegar, y no voy a pasarme el tiempo controlando cómo.\n\nLa diferencia no es emocional. Es de energía.\n\nCuando manifiestas con tensión — revisando señales, forzando resultados, calculando si lo mereces — la energía que sale es urgencia.\n\nAbre la mano. No el deseo. Solo el control.',
    on_screen_text: 'Desapego no es indiferencia.\nEs confiar en que ya está en camino.',
    visual_direction: 'Reel hablado íntimo. Luz cálida. Pausa significativa antes de la conclusión.',
    caption: 'Soltar no significa que ya no te importa.\n\nSignifica que ya no necesitas controlar el cómo.\n\nEsa es la diferencia entre desapego e indiferencia.\n\n💾 Guarda para cuando sientas esa tensión de querer controlar.',
    cta: 'Guarda para cuando sientas la necesidad de controlar el resultado.',
    hashtags: ['desapego', 'manifestacion', 'confianza', 'crecimientopersonal', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking with calm authority, warm intimate lighting, medium close-up, deliberate pacing with meaningful pauses, serene background.',
  },

  amor_relaciones: {
    strategy: {
      objective: 'Guardados — práctica de scripting',
      pain_used: 'No sé cómo manifestar amor sin obsesionarme con una persona específica',
      private_thought: '"¿Estoy manifestando a alguien específico? ¿Eso está bien?"',
      desire: 'Una forma de manifestar amor que se sienta limpia y alineada',
      primary_emotion: 'Apertura',
      psychological_mechanism: 'Scripting guiado — identidad futura',
      angle: 'El scripting de amor no describe a la persona, describe cómo te sientes tú',
    },
    hook: 'El scripting de amor que cambia el enfoque — y que nadie te explica así.',
    script: 'No describes a una persona específica.\nNo describes características físicas.\n\nDescribes cómo te sientes tú.\n\nEscribe:\n"Estoy en una relación donde me siento libre, recibida, elegida."\n\n"Soy libre de ser yo misma. Soy recibida. Soy elegida."\n\n"Esta relación llega a mí de formas que todavía no imagino, pero estoy abierta a reconocerla cuando llegue."\n\nEl scripting de amor no es sobre la persona.\nEs sobre la versión de ti que ya está en esa relación.',
    on_screen_text: 'El scripting de amor\nno describe a la persona.\nDescribe cómo te sientes tú.',
    visual_direction: 'Reel hablado. Las frases de scripting aparecen en pantalla durante el dictado. Pausa entre cada una. Victoria habla con calma.',
    caption: 'Qué escribir exactamente cuando haces scripting para manifestar amor.\n\nLas frases más importantes no son sobre la persona — son sobre ti.\n\n💾 Guarda para tu próxima sesión de scripting.',
    cta: 'Guarda para tu próxima sesión de scripting de amor.',
    hashtags: ['scripting', 'manifestacion', 'amor', 'journaling', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking warmly to camera, text scripting phrases appearing on screen with pauses, soft romantic lighting, intimate framing, deliberate pace.',
  },

  suerte: {
    strategy: {
      objective: 'Alcance — identificación masiva',
      pain_used: 'La suerte me pasa a otras, a mí no me llega aunque hago todo bien',
      private_thought: '"Algunas personas tienen suerte y otras no. Yo soy de las que no."',
      desire: 'Sentir que la suerte también puede ser para mí',
      primary_emotion: 'Esperanza activa',
      psychological_mechanism: 'Desmitificación + invitación a observar',
      angle: 'La suerte como resultado de observación y disponibilidad, no de azar',
    },
    hook: 'Las personas con "buena suerte" no tienen algo que tú no tienes. Tienen una forma distinta de mirar.',
    script: 'Cuando estudiamos qué hace que algunas personas parezcan tener más suerte, una cosa aparece una y otra vez: no es que les pasen más cosas buenas. Es que están más disponibles para reconocerlas cuando pasan.\n\nVen una conversación donde otros ven cortesía.\nVen una oportunidad donde otros ven inconveniencia.\nDicen que sí antes de entender el cómo completo.\n\nLa suerte puede cultivarse. No como promesa, sino como práctica: cuando te mantienes en movimiento, cuando estás abierta, cuando no descartas algo solo porque no se parece a lo que imaginabas.\n\n¿Qué estarías viendo diferente si estuvieras buscando suerte activamente?',
    on_screen_text: 'La suerte se cultiva.\nNo es azar — es disponibilidad.',
    visual_direction: 'Reel educativo conversacional. Victoria habla con energía tranquila. Luz cálida. Cierra con pregunta directa a cámara.',
    caption: 'La suerte puede observarse, cultivarse, practicarse.\n\nNo como certeza — sino como forma de mirar.\n\n¿Qué verías diferente si decidieras buscarla activamente esta semana?\n\n💬 Cuéntame en comentarios.',
    cta: 'Comenta: ¿qué estás observando diferente hoy?',
    hashtags: ['suerte', 'manifestacion', 'oportunidades', 'crecimientopersonal', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking with warm energy to camera, natural light, open expression, medium shot, conversational and direct.',
  },

  rituales: {
    strategy: {
      objective: 'Guardados — práctica diaria',
      pain_used: 'No sé si mis rituales están bien hechos o si los hago por hacer',
      private_thought: '"¿Realmente esto funciona o es solo un hábito vacío?"',
      desire: 'Que el ritual se sienta significativo, no mecánico',
      primary_emotion: 'Presencia',
      psychological_mechanism: 'Reencuadre del ritual como intención consciente',
      angle: 'El ritual como conversación consciente con tu propia energía',
    },
    hook: 'Un ritual no vale por lo que haces. Vale por la atención que pones mientras lo haces.',
    script: 'No hace falta una vela específica, un día concreto o una secuencia perfecta.\n\nLo que convierte una acción en un ritual es que decides que ese momento es para poner atención. Para decir: esto es lo que quiero, y esto es cómo voy a recibirlo.\n\nPuede ser escribir tres cosas antes de dormir.\nPuede ser el café de la mañana con una intención.\nPuede ser caminar y repetir mentalmente algo que quieres consolidar.\n\nLa práctica importa. Pero lo que más importa es que estés presente mientras la haces.',
    on_screen_text: 'Un ritual es presencia.\nNo es una secuencia perfecta.',
    visual_direction: 'Reel íntimo. Luz tenue. Ritmo lento. Victoria puede estar hablando desde una mesa de trabajo o espacio personal.',
    caption: 'No necesitas el ritual perfecto.\n\nNecesitas el momento de presencia donde decides qué quieres y cómo recibirlo.\n\n¿Cuál es tu ritual o práctica actual?\n\n💾 Guarda para recordar qué es lo que realmente importa.',
    cta: 'Cuéntame en comentarios: ¿cuál es una práctica que ya tienes y podrías hacer con más intención?',
    hashtags: ['rituales', 'manifestacion', 'habitos', 'intencion', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking softly and deliberately to camera, intimate warm light, slow pace, reflective tone, close framing.',
  },

  senales: {
    strategy: {
      objective: 'Alcance + guardados',
      pain_used: 'Espero señales claras y perfectas que confirmen que voy bien',
      private_thought: '"Si fuera la señal correcta, lo sabría sin dudas. No sé si este es mi momento."',
      desire: 'Aprender a confiar en lo que ya está llegando',
      primary_emotion: 'Calma y apertura',
      psychological_mechanism: 'Reencuadre + invitación a observar',
      angle: 'Las señales no llegan con subtítulos',
    },
    hook: 'Puede que la señal que estás esperando no se vea como una señal.',
    script: 'Cuando estamos esperando una respuesta, queremos algo imposible de ignorar: un número, una coincidencia perfecta, algo que nos confirme qué hacer.\n\nPero a veces la señal es mucho más sencilla. Puede ser una conversación que se repite, una idea a la que sigues volviendo o una oportunidad que aparece justo cuando estabas pensando en cambiar de dirección.\n\nNo necesitas convertir todo en una señal. Solo empieza a observar qué cosas siguen llamando tu atención.\n\nA veces la guía no es dramática. Es constante.',
    on_screen_text: 'No necesitas más señales.\nSolo empieza a observar.',
    visual_direction: 'Reel hablado. Voz tranquila. Luz suave. Victoria puede hablar sentada, en un ambiente relajado. Sin prisa.',
    caption: 'Las señales no llegan con subtítulos.\n\nPero sí se repiten.\n\n¿Hay algo que sigue apareciendo en tu vida y todavía no sabes bien qué significa?\n\n💬 Cuéntame en comentarios.',
    cta: 'Comenta: ¿qué idea o situación sigue apareciendo en tu vida últimamente?',
    hashtags: ['senales', 'sincronias', 'manifestacion', 'intuicion', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking calmly to camera, soft diffused light, relaxed intimate setting, slow deliberate pace, open gentle expression.',
  },

  numeros_fechas: {
    strategy: {
      objective: 'Guardados + comentarios',
      pain_used: 'Siento que si no aprovecho la fecha o el número especial, pierdo la oportunidad',
      private_thought: '"Hoy es 11:11 y no hice nada. ¿Perdí mi ventana?"',
      desire: 'Que las fechas sean recordatorios motivadores, no presión',
      primary_emotion: 'Alivio + presencia',
      psychological_mechanism: 'Reencuadre + invitación a usar la fecha como herramienta',
      angle: 'Las fechas como recordatorios de intención, no como ventanas que se cierran',
    },
    hook: 'El 11:11 no es una ventana que se cierra. Es un recordatorio de que puedes poner una intención ahora.',
    script: 'Las fechas de intención — el 11/11, el 1/1, las lunas, los portales energéticos — no son ventanas mágicas que se cierran si no las aprovechas perfectamente.\n\nSon recordatorios. Te dicen: hoy puedes poner una intención con más conciencia que ayer.\n\nY eso es suficiente. No necesitas haber hecho el ritual correcto a la hora exacta. Solo necesitas tomarte un momento para escribir lo que quieres, con presencia real.\n\nUna cosa. Concreta. Sin prisa.\n\nEso ya es suficiente.',
    on_screen_text: 'La fecha no hace el ritual.\nTu intención sí.',
    visual_direction: 'Reel tranquilizador. Voz calmada. Victoria habla como quien quita presión, no como quien impone urgencia.',
    caption: 'No perdiste el portal.\n\nLas fechas son recordatorios, no ventanas que se cierran.\n\nHoy todavía puedes escribir una intención.\n\n¿Cuál es la tuya?\n\n💬 Cuéntame en comentarios.',
    cta: 'Comenta: ¿cuál es una intención que quieres reforzar esta semana?',
    hashtags: ['1111', 'numerologia', 'manifestacion', 'intencion', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking reassuringly to camera, calm warm light, close framing, gentle tone, no urgency in body language.',
  },

  deseos_concretos: {
    strategy: {
      objective: 'Guardados + comentarios',
      pain_used: 'Pido todo al mismo tiempo y siento que nada llega',
      private_thought: '"¿Cómo se supone que debo elegir solo una cosa si las quiero todas?"',
      desire: 'Claridad sobre en qué enfocarse para que algo realmente avance',
      primary_emotion: 'Claridad y dirección',
      psychological_mechanism: 'Instrucción concreta + foco como herramienta',
      angle: 'Elegir un deseo concreto no es renunciar a los demás',
    },
    hook: 'Lo que le pides al universo no puede ser vago si quieres que algo se mueva.',
    script: 'Cuando pedimos todo al mismo tiempo, ninguna petición recibe suficiente profundidad.\n\nHay una práctica sencilla: elegir una cosa. Ponle nombre. Ponle fecha.\n\nNo porque el universo solo pueda atender una petición a la vez. Sino porque cuando tú enfocas tu energía en algo concreto, tu comportamiento también cambia. Empiezas a ver oportunidades que antes no veías. Tomas decisiones más alineadas.\n\nEnfocarte no es renunciar a las demás cosas. Es saber qué viene primero.\n\n¿Cuál es la cosa que — si llegara en los próximos 90 días — cambiaría todo lo demás?',
    on_screen_text: 'Enfocarte no es renunciar.\nEs saber qué viene primero.',
    visual_direction: 'Reel educativo. Victoria habla con claridad y energía tranquila. Texto en pantalla en los puntos clave.',
    caption: 'No es que el universo no te escuche cuando pides varias cosas.\n\nEs que cuando todo es prioridad, tú misma no sabes en qué dirección moverse.\n\nUna cosa. Concreta. Con fecha.\n\n¿Cuál es la tuya?\n\n💬 Cuéntame en comentarios.',
    cta: 'Comenta: ¿cuál es la cosa que — si llegara en 90 días — cambiaría todo lo demás?',
    hashtags: ['deseos', 'manifestacion', 'foco', 'intencion', 'eluniversodevictoria'],
    ai_video_prompt: 'Woman speaking with clarity and warmth to camera, direct eye contact, medium lighting, confident but approachable tone.',
  },
}

// ── FORMAT ADAPTERS ──────────────────────────────────────────────────
// Each adapter receives the theme's base and returns overrides for
// script / on_screen_text / hook / visual_direction.
// Only fields explicitly returned are replaced — everything else stays from base.

type FormatOverride = Partial<Pick<ReelBase, 'script' | 'on_screen_text' | 'hook' | 'visual_direction'>>
type FormatAdapter = (base: ReelBase) => FormatOverride

const FORMAT_ADAPTERS: Partial<Record<ContentFormatType, FormatAdapter>> = {

  reel_storytelling: (base) => {
    const pain = base.strategy.pain_used
    const desire = base.strategy.desire
    const hook = base.hook
    return {
      script: `Hubo un momento en que ${pain.toLowerCase().replace(/no /,'').split('—')[0].trim()} era lo que más peso me daba.\n\nY lo que hacía era intentar resolverlo desde fuera — buscando la técnica correcta, la práctica correcta, el momento correcto.\n\nHasta que algo cambió. No de golpe. Poco a poco noté que lo que quería era ${desire.toLowerCase()}.\n\nDesde entonces trabajo distinto. No desde la urgencia — desde lo que ya soy.\n\nY eso fue lo que abrió la puerta.`,
      visual_direction: 'Reel storytelling. Victoria narra en primera persona, pausando en los momentos de tensión. Luz íntima. Ritmo lento al inicio, más seguro al final. Puede incluir texto en pantalla en la resolución.',
      on_screen_text: hook.split('—')[0].trim().replace(/[.?!]$/, '') + '.',
    }
  },

  broll_voiceover: (base) => {
    // Pure narration — no camera directions, no references to Victoria speaking on screen.
    // Script should sound like an audio track over aesthetic footage.
    const pain = base.strategy.pain_used.split('—')[0].toLowerCase()
    const desire = base.strategy.desire.toLowerCase()
    return {
      script: `A veces ${pain} se convierte en el punto de partida de todo lo que hacemos.\n\nY sin notarlo, empezamos a movernos desde ahí. Desde la falta. Desde lo que todavía no llegó.\n\nPero hay otra forma de moverse. Desde lo que ya sabes que quieres. Desde ${desire}.\n\nNo como promesa. Como práctica.\n\nDía a día. En pequeño. Sin prisa.`,
      visual_direction: 'B-roll aesthetic: flores, luz de ventana, journaling, café, manos escribiendo, cielo al amanecer. Texto del hook en pantalla al inicio. Voice over en todo el video. Sin planos de Victoria hablando a cámara.',
      on_screen_text: base.hook,
    }
  },

  affirmation: (base) => {
    const desire = base.strategy.desire.toLowerCase()
    return {
      script: `Repite después de mí — y date permiso de sentirlo mientras lo dices:\n\n"Estoy abierta a recibir lo que quiero."\n\n"Me permito ${desire}."\n\n"Confío en que lo que es para mí va a llegar."`,
      on_screen_text: `"Me permito ${desire}."`,
      visual_direction: 'Reel de afirmación. Victoria habla despacio, con pausa entre cada frase. Texto de cada afirmación en pantalla. Música suave. Luz cálida.',
    }
  },

  visualization: (base) => {
    const desire = base.strategy.desire.toLowerCase()
    const emotion = base.strategy.primary_emotion.toLowerCase()
    return {
      script: `Cierra los ojos si puedes.\n\nRespira despacio. Sin prisa.\n\nAhora imagínate en el momento en que ya tienes lo que quieres. No como fantasía — como algo que sientes en el cuerpo.\n\nObserva cómo te sientes. Qué hay de distinto en ti. Qué sensación es esa — la de ${emotion}, la de ${desire}.\n\nQuédate ahí unos segundos.\n\nAhora abre los ojos.\n\nEsa sensación es tu punto de partida.`,
      on_screen_text: `Imagínate ya ahí.\n¿Qué sientes?`,
      visual_direction: 'Visualización guiada. Victoria habla con voz tranquila y cadencia lenta. Música suave instrumental. Texto en pantalla en los momentos clave. Luz muy suave.',
    }
  },

  scripting_guided: (base) => {
    const desire = base.strategy.desire.toLowerCase()
    return {
      script: `Abre una nota o un papel.\n\nEscribe la fecha de hoy.\n\nY luego escribe:\n"Estoy disponible para ${desire}."\n\nRespira.\n\n"Lo reconoceré cuando llegue."\n\nRespira.\n\n"Confío en el proceso, aunque todavía no vea todos los pasos."\n\nNo hace falta escribir más. Con esto es suficiente.\n\nHaz esto tres días seguidos y observa qué cambia en cómo te mueves.`,
      on_screen_text: `"Estoy disponible para ${desire}."`,
      visual_direction: 'Scripting guiado. Victoria habla despacio. Cada frase aparece en pantalla mientras la dice. Pausa real entre instrucciones. Sin prisa.',
    }
  },

  qa_response: (base) => {
    const pain = base.strategy.pain_used.split('—')[0].toLowerCase()
    return {
      script: `Me preguntaron: ¿qué hago cuando ${pain} y siento que nada funciona?\n\nLo primero que les digo es: no lo estás haciendo mal.\n\nA veces el bloqueo no está en la práctica. Está en desde dónde practicas.\n\nSi lo haces desde la urgencia — desde la falta — lo que sale hacia afuera es tensión. Y la tensión no atrae, bloquea.\n\nEl cambio empieza cuando lo practicas desde lo que ya tienes. Desde lo que ya sabes. Desde quien ya eres.\n\n¿Eso te ayuda?`,
      on_screen_text: `"¿Qué hago cuando nada funciona?"`,
      visual_direction: 'Reel de respuesta directa. Victoria responde como si contestara un comentario real. Tono cercano y sin distancia. Puede haber el comentario visible al inicio en pantalla.',
    }
  },

  pov: (base) => {
    const pain = base.strategy.pain_used.split('—')[0].toLowerCase().replace(/^no /, '')
    return {
      script: `POV: llevas semanas haciendo todo lo que dicen — scripting, visualización, afirmaciones — y sigues sin ver resultados.\n\nY lo peor no es la espera. Es la duda.\n\n"¿Será que no lo estoy haciendo bien? ¿Será que no es para mí?"\n\nEsto te lo digo directo: el problema no es la práctica. Es que la estás haciendo desde quien quieres ser, no desde quien ya estás siendo.\n\nCambia eso, y cambia todo.`,
      on_screen_text: `POV: haces todo bien\ny aun así no llega.`,
      visual_direction: 'Formato POV. Texto de situación al inicio en pantalla. Victoria habla directo a cámara como si respondiera a esa persona. Energía directa y cercana.',
    }
  },

  reel_visual: (base) => {
    return {
      script: '',
      on_screen_text: base.hook,
      visual_direction: 'Video aesthetic sin narración. Footage de naturaleza, luz, texturas. Frase del hook en pantalla con tipografía limpia. Música instrumental. Sin voice over ni Victoria en cámara.',
    }
  },
}

// ── DEFAULT REEL (technical fallback only) ──────────────────────────
// Should never be reached for known MacroThemes — each has its own REEL_PIECES entry.
const DEFAULT_REEL: ReelBase = {
  strategy: {
    objective: 'Conexión y alcance',
    pain_used: 'La distancia entre quien soy y quien quiero ser',
    private_thought: '"¿Y si nunca llego a ser esa versión de mí misma?"',
    desire: 'Sentir que el cambio es posible y ya está ocurriendo',
    primary_emotion: 'Esperanza',
    psychological_mechanism: 'Identificación + Permiso',
    angle: 'El proceso gradual como forma válida de cambio',
  },
  hook: '¿Y si el cambio que buscas ya está ocurriendo?',
  script: 'No es que las cosas no estén moviéndose.\n\nEs que a veces el cambio ocurre en un nivel que todavía no se ve.\n\nEn las decisiones pequeñas. En lo que dejas de tolerar. En lo que empiezas a pedir.\n\nAntes de buscar la prueba grande, pregúntate: ¿qué cambió en mí en los últimos meses?\n\nEso también cuenta.',
  on_screen_text: '¿Qué cambió en ti\nen los últimos meses?',
  visual_direction: 'Reel hablado íntimo. Luz suave. Victoria habla con calma y presencia. Sin prisas.',
  caption: '¿Cuándo fue la última vez que reconociste cuánto has cambiado?\n\nEl progreso no siempre se ve desde fuera. Pero ocurre.\n\n💬 Cuéntame en comentarios: ¿qué cambió en ti este año?',
  cta: 'Escribe en comentarios: ¿qué cambió en ti este año?',
  hashtags: ['manifestacion', 'crecimientopersonal', 'autoconocimiento', 'eluniversodevictoria'],
  ai_video_prompt: 'Woman speaking softly to camera, golden warm light, close intimate framing, thoughtful pauses, soft background bokeh, cinematic quality.',
}

// ── POST / IMAGE TEXT DATA ──────────────────────────────────────────

const IMAGE_TEXTS: Record<MacroTheme, Record<ImageTextLength, string>> = {
  manifestacion: {
    short:  'Manifiestas desde quien ya eres, no desde quien quieres ser.',
    medium: 'El error de la manifestación no es técnico.\nEs de identidad.\n\nNo manifiestas desde el deseo — manifiestas desde quien ya estás siendo.',
    long:   'Querida yo,\n\nLlevas años haciendo las prácticas correctamente. Las afirmaciones. El scripting. La visualización.\n\nY el bloqueo no era la técnica.\nEra que seguías pidiéndole al universo desde quien querías ser — no desde quien ya eres.\n\nHoy puedo decirte que esa diferencia lo cambia todo.',
  },
  dinero: {
    short:  'No buscabas el dinero. Buscabas el permiso de sentirte segura.',
    medium: 'La relación con el dinero cambia cuando entiendes qué buscabas realmente.\n\nNo era el número. Era la sensación de no tener que justificarte.',
    long:   'Querida yo,\n\nAños buscando dinero y resultó que buscaba seguridad.\n\nNo es lo mismo. Y la diferencia importa muchísimo.\n\nPorque cuando lo entendí, también entendí por qué las estrategias financieras solas nunca eran suficientes. Había trabajo emocional primero.',
  },
  abundancia: {
    short:  'La abundancia también llega en calma.',
    medium: 'La abundancia no siempre entra primero como dinero.\nA veces llega como claridad, paz y nuevas oportunidades.\n\nDeja de buscarla solo en el futuro.',
    long:   'Querida yo,\n\nLa abundancia no es una meta. Ya está presente en formas que quizás no reconociste hoy.\n\nEstá en la conversación que te abrió una puerta. En el mensaje que llegó en el momento justo. En la claridad que sentiste cuando ya no lo buscabas.',
  },
  suerte: {
    short:  'La suerte también puede cultivarse.',
    medium: 'Las personas con "buena suerte" no tienen algo distinto.\nEstán más disponibles para reconocerla cuando aparece.\n\nLa suerte puede cultivarse.',
    long:   'Querida yo,\n\nLa suerte no es algo que te pasa. Puede cultivarse.\n\nCuando manifiestas algo específico. Cuando te mantienes en movimiento. Cuando dices que sí antes de entender el cómo completo.',
  },
  oportunidades: {
    short:  'Hay oportunidades que no ves porque no crees que son para ti.',
    medium: 'La oportunidad que manifestaste puede ya estar aquí.\n\nLlegará disfrazada de algo pequeño, inconveniente o distinto a lo que imaginaste.\n\n¿Estás abierta a reconocerla?',
    long:   'Querida yo,\n\nHay tres momentos en la manifestación de una oportunidad.\n\nPrimero: pedir algo concreto.\nSegundo: mantenerte en movimiento.\nTercero — el más difícil — decir que sí antes de entender el cómo.',
  },
  rituales: {
    short:  'Un ritual es presencia, no una secuencia perfecta.',
    medium: 'Un ritual no requiere condiciones perfectas.\nEs la decisión de poner atención donde quieres que crezca.\n\nSiete minutos. Una intención. Eso puede ser suficiente.',
    long:   'Querida yo,\n\nNo tienes que hacer 30 días de scripting ni rituales perfectos.\n\nSolo necesitas un momento al día en que digas: esto es lo que quiero, y esto es cómo voy a recibirlo.',
  },
  senales: {
    short:  'Las señales no siempre llegan con subtítulos.',
    medium: 'Las señales no llegan con subtítulos.\nLlegan como conversaciones inesperadas, números repetidos, ideas que aparecen en el momento justo.',
    long:   'Querida yo,\n\nLa última señal que recibiste probablemente llegó disfrazada de coincidencia.\n\nUna conversación que te dejó pensando. Un número que apareció de nuevo. Una idea que llegó sola cuando más la necesitabas.',
  },
  numeros_fechas: {
    short:  'La fecha no hace el ritual. Tu intención sí.',
    medium: 'El 11/11 no es la única ventana para manifestar.\nPero sí puede ser un recordatorio poderoso.\n\nHoy escribe una cosa — una sola — que quieres.',
    long:   'Querida yo,\n\nLas fechas de intención no son ventanas mágicas que se cierran si no las aprovechas perfectamente.\n\nSon recordatorios de que hoy puedes poner una intención con más conciencia que ayer.',
  },
  deseos_concretos: {
    short:  'Enfocarte no es renunciar. Es saber qué viene primero.',
    medium: 'Lo que le pides al universo no puede ser vago.\n\nCuando pides todo, ninguna petición recibe suficiente profundidad.\nElige una cosa. Ponle nombre. Ponle fecha.',
    long:   'Querida yo,\n\nHay una pregunta para cuando no sabes en qué deseo enfocarte:\n\n¿Cuál cambiaría todo lo demás si llegara en 90 días?\n\nEmpieza por ahí.',
  },
  creencias: {
    short:  '¿De dónde vino la frase "yo no soy de las que tienen eso"?',
    medium: 'Esa frase que tienes tan normalizada no la elegiste.\nLa heredaste.\n\nDe cómo tu familia hablaba del dinero. Del tono en que se decía "ese es rico".',
    long:   'Querida yo,\n\nNo inventaste la creencia de que la prosperidad no es para ti.\nLa absorbiste.\n\nComo toda herencia: puedes examinarla, quedarte con lo que funciona y devolver el resto.',
  },
  merecimiento: {
    short:  'Nadie te va a dar lo que tú misma no consideras que mereces.',
    medium: 'Cuando no te crees merecedora, tu comportamiento cambia antes de que algo externo pase.\n\nDejas de pedir. Te adelantas al rechazo.\nY todo confirma lo que ya decidiste.',
    long:   'Querida yo,\n\nPuedes saber — en teoría — que mereces, que vales, que eres suficiente.\n\nY aun así, en las decisiones pequeñas, seguir actuando como si no.\n\nLa brecha entre saber y sentir no es un defecto.\nEs el trabajo real.',
  },
  desapego: {
    short:  'Mano abierta: no suelto el deseo, suelto el control.',
    medium: 'Soltar no es rendirse.\nEs decir: lo quiero, confío en que llegue, y estoy abierta a que llegue de una forma que todavía no imagino.',
    long:   'Querida yo,\n\nSoltar no significa que ya no te importa.\nSignifica que ya no necesitas controlar el cómo.\n\nLo quieres. Lo pides. Lo escribes. Y luego abres la mano.',
  },
  amor_relaciones: {
    short:  'El scripting de amor no describe a la persona. Describe cómo te sientes tú.',
    medium: 'Cuando haces scripting para manifestar amor, no describes características de una persona.\n\nEscribes: "Estoy en una relación donde me siento libre, recibida, elegida."',
    long:   'Querida yo,\n\nEscribir sobre la relación que quieres no es obsesión. Es intención.\n\nPero la intención más poderosa no es describir a la persona. Es describir cómo te sentirás tú.\n\nLibre. Recibida. Elegida.',
  },
}

// ── CAROUSEL DATA ───────────────────────────────────────────────────

type CarouselBase = Omit<CarouselContent, 'kind' | 'visual_style' | 'visual_style_label'>

function makeCarousel(
  strategy: ContentStrategy,
  topic: string,
  goal: string,
  angle: string,
  slides: CarouselSlide[],
  visual_notes: string,
  caption: string,
  cta: string,
  hashtags: string[],
): CarouselBase {
  const coverSlide = slides.find(s => s.role === 'cover')
  return {
    strategy,
    topic,
    goal,
    angle,
    cover_text: coverSlide?.text ?? slides[0].text,
    slides,
    visual_notes,
    caption,
    cta,
    hashtags,
  }
}

const CAROUSEL_PIECES: Partial<Record<MacroTheme, CarouselBase>> = {
  creencias: makeCarousel(
    {
      objective: 'Guardados + compartidos',
      pain_used: 'Yo no soy de las que tienen eso — identidad de clase y merecimiento',
      private_thought: '"Eso no es para gente como yo. En mi familia siempre fue difícil."',
      desire: 'Entender de dónde vienen las creencias para poder examinarlas',
      primary_emotion: 'Claridad',
      psychological_mechanism: 'Revelación de origen → Permiso de soltar',
      angle: 'Las creencias sobre el dinero que heredaste sin elegirlas',
    },
    'Las creencias sobre el dinero que heredaste sin elegirlas',
    'Que la audiencia identifique creencias heredadas y se sienta con el permiso de examinarlas',
    'No las inventaste. Las absorbiste — y se pueden devolver.',
    [
      { slide: 1, role: 'cover', text: '"Yo no soy\nde las que tienen eso"' },
      { slide: 2, role: 'development', text: 'Nunca elegiste creerlo.\n\nLo heredaste sin saberlo.' },
      { slide: 3, role: 'development', text: 'De cómo tu familia hablaba del dinero.\nDel tono en que se decía "ese es rico".' },
      { slide: 4, role: 'development', text: 'Del mensaje de que pedir demasiado era de mal gusto.\nDe ver que quien sobresalía pagaba un precio.' },
      { slide: 5, role: 'development', text: 'Nunca fue una decisión consciente.\n\nFue una herencia.' },
      { slide: 6, role: 'development', text: 'Y como toda herencia:\npuedes examinarla,\nquedarte con lo que sirve,\ny devolver el resto.' },
      { slide: 7, role: 'cta', text: '¿Qué creencia sobre el dinero llevas sin examinar?\n\nEscríbela en comentarios.' },
    ],
    'Fondo crema o blanco roto. Tipografía serif en negro. Slide 1 con la frase en grande centrada. Slides de desarrollo con texto pequeño y espacio en blanco generoso. Sin ilustraciones.',
    'Esa frase que tienes tan normalizada no la elegiste.\n\nLa heredaste.\n\nY se puede examinar. Se puede soltar.\n\n💾 Guarda si reconociste alguna.',
    'Guarda este carrusel para cuando vuelva esa voz que dice "no es para ti".',
    ['creencias', 'abundancia', 'dinero', 'autoconocimiento', 'eluniversodevictoria'],
  ),

  manifestacion: makeCarousel(
    {
      objective: 'Guardados — contenido de referencia',
      pain_used: 'Lo hago bien pero no funciona — no sé qué estoy haciendo mal',
      private_thought: '"Si a otras personas les funciona y a mí no, el problema soy yo."',
      desire: 'Entender exactamente qué cambia la manifestación sin convertirlo en otro sistema a seguir',
      primary_emotion: 'Claridad + alivio',
      psychological_mechanism: 'Desmitificación progresiva + Reencuadre',
      angle: 'Los tres errores de la manifestación que no son lo que crees',
    },
    'Los 3 errores de la manifestación que nadie te explica',
    'Que la audiencia identifique el error que más resuena y lo guarde como referencia',
    'No es la técnica. Es desde dónde manifiestas.',
    [
      { slide: 1, role: 'cover', text: '3 errores de la\nmanifestación que\nnadie te explica' },
      { slide: 2, role: 'development', text: 'Error #1:\nManifestas desde el deseo, no desde la identidad.\n\nPedir desde la falta crea urgencia.\nActuar desde quien ya eres crea confianza.' },
      { slide: 3, role: 'development', text: 'Error #2:\nPides todo al mismo tiempo.\n\nCuando todo es prioridad,\nnada recibe suficiente energía.\nElige una cosa. Ponle nombre.' },
      { slide: 4, role: 'development', text: 'Error #3:\nEsperas señales para moverte.\n\nLas oportunidades no llegan a quien espera.\nLlegan cuando estás en movimiento.' },
      { slide: 5, role: 'development', text: 'El resumen:\n\nIdentidad sobre técnica.\nFoco sobre cantidad.\nMovimiento sobre espera.' },
      { slide: 6, role: 'cta', text: '¿Cuál de estos tres es el que más reconoces en ti?\n\nComéntalo abajo.' },
    ],
    'Fondo oscuro (casi negro). Texto en blanco o crema. Números de error en dorado. Estilo editorial limpio. Slide de portada con tipografía grande.',
    'El problema de la manifestación casi nunca es la técnica.\n\nEs desde dónde la haces.\n\n¿Cuál de estos errores reconoces más en ti?\n\n💾 Guarda para cuando necesites recordarlo.',
    'Comenta cuál error reconociste más en ti.',
    ['manifestacion', 'leyatraccion', 'crecimientopersonal', 'eluniversodevictoria'],
  ),

  merecimiento: makeCarousel(
    {
      objective: 'Guardados + conexión emocional',
      pain_used: 'Sé en teoría que merezco, pero en la práctica no actúo como si fuera verdad',
      private_thought: '"Esto no puede ser para mí. En algún momento lo descubren."',
      desire: 'Que el merecimiento sea una experiencia real, no solo un concepto',
      primary_emotion: 'Reconocimiento profundo',
      psychological_mechanism: 'Identificación + señales de comportamiento concretas',
      angle: 'Cómo se ve el no-merecimiento en tu vida diaria (sin que lo parezca)',
    },
    'Cómo se ve el no-merecimiento en tu vida diaria',
    'Que la audiencia reconozca sus propios patrones y se sienta vista',
    'No siempre se llama "no me creo merecedora". Se llama otra cosa.',
    [
      { slide: 1, role: 'cover', text: 'Cómo se ve el\nno-merecimiento\nen tu vida diaria' },
      { slide: 2, role: 'development', text: 'No siempre se llama\n"no me lo merezco".\n\nSe llama otra cosa.' },
      { slide: 3, role: 'development', text: 'Se llama:\npedir disculpas por ocupar espacio.\n\nMinimizar tus logros antes de que alguien más lo haga.' },
      { slide: 4, role: 'development', text: 'Se llama:\nnegociar hacia abajo antes de empezar a pedir.\n\nNo cobrar lo que realmente vale.' },
      { slide: 5, role: 'development', text: 'Se llama:\nno pedir lo que necesitas para que no parezca demasiado.' },
      { slide: 6, role: 'development', text: 'Y todos estos patrones\ntienen una sola raíz:\n\nNo terminas de creerte\nque sí es para ti.' },
      { slide: 7, role: 'cta', text: '¿Cuál de estos patrones reconociste en ti?\n\nEscríbelo en comentarios. Es el primer paso.' },
    ],
    'Fondo beige cálido. Tipografía sans-serif moderna para los slides de contenido. Slide de portada con serif. Texto centrado. Mucho espacio blanco.',
    'No siempre se llama "no me lo merezco".\n\nA veces se llama pedir menos. Minimizar. No cobrar lo que vale.\n\n¿Reconociste alguno?\n\n💾 Guarda si esto tocó algo.',
    'Guarda para cuando necesites recordar por qué empezar a creértelo importa.',
    ['merecimiento', 'autoestima', 'manifestacion', 'valorpropio', 'eluniversodevictoria'],
  ),
}

const DEFAULT_CAROUSEL: CarouselBase = makeCarousel(
  {
    objective: 'Guardados + identificación masiva',
    pain_used: 'No sé cómo aplicar lo que aprendo sobre manifestación',
    private_thought: '"Lo entiendo, pero no lo pongo en práctica."',
    desire: 'Una guía clara que pueda guardar y volver a ver',
    primary_emotion: 'Claridad',
    psychological_mechanism: 'Instrucción progresiva + cierre con acción',
    angle: 'Un proceso concreto, paso a paso',
  },
  'Lo que nadie te dice sobre manifestar en la vida real',
  'Que la audiencia tenga algo concreto que guardar y aplicar',
  'La manifestación como práctica diaria, no como evento especial',
  [
    { slide: 1, role: 'cover', text: 'Lo que nadie te dice\nsobre manifestar\nen la vida real' },
    { slide: 2, role: 'development', text: 'La manifestación no es\nun evento especial.\n\nEs una práctica diaria.' },
    { slide: 3, role: 'development', text: 'Paso 1:\nSé específica en lo que pides.\n\nLo vago no recibe suficiente energía.' },
    { slide: 4, role: 'development', text: 'Paso 2:\nActúa desde quien ya lo tiene.\n\nNo desde quien lo desea.' },
    { slide: 5, role: 'development', text: 'Paso 3:\nSuelta el control del cómo.\n\nNo el deseo. Solo la forma en que llega.' },
    { slide: 6, role: 'cta', text: '¿Por cuál de estos pasos empiezas hoy?\n\nCuéntamelo en comentarios.' },
  ],
  'Estilo minimalista. Fondo claro, texto oscuro. Portada destacada con serif. Slides de contenido con sans-serif.',
  'La manifestación no es magia. Es práctica.\n\nY tiene pasos concretos.\n\n¿Por cuál empiezas hoy?\n\n💾 Guarda para tenerlo siempre a mano.',
  'Guarda para tener el proceso siempre a mano.',
  ['manifestacion', 'crecimientopersonal', 'abundancia', 'eluniversodevictoria'],
)

// ── DECISION LOGIC ──────────────────────────────────────────────────

type LengthWeights = { short: number; medium: number; long: number }

export type LengthBias = { short?: number; medium?: number; long?: number }

const FORMAT_LENGTH_WEIGHTS: Partial<Record<ContentFormatType, LengthWeights>> = {
  morning_practice:  { short: 5, medium: 4, long: 1 },
  night_practice:    { short: 3, medium: 4, long: 3 },
  post:              { short: 6, medium: 3, long: 1 },
  symbolic_object:   { short: 4, medium: 5, long: 1 },
  concrete_desire:   { short: 5, medium: 4, long: 1 },
  signal_date:       { short: 5, medium: 4, long: 1 },
  story:             { short: 6, medium: 3, long: 1 },
  affirmation:       { short: 8, medium: 2, long: 0 },
  pov:               { short: 3, medium: 5, long: 2 },
  scripting_guided:  { short: 2, medium: 4, long: 4 },
}

type LengthBiasDir = 'towards_long' | 'towards_short' | 'towards_medium' | 'neutral'
const THEME_LENGTH_BIAS: Partial<Record<MacroTheme, LengthBiasDir>> = {
  merecimiento:     'towards_long',
  desapego:         'towards_long',
  amor_relaciones:  'towards_long',
  numeros_fechas:   'towards_short',
  deseos_concretos: 'towards_short',
  rituales:         'towards_medium',
}

function applyThemeBias(w: LengthWeights, bias: LengthBiasDir): LengthWeights {
  switch (bias) {
    case 'towards_long':   return { short: Math.max(0, w.short - 1), medium: w.medium,     long: w.long + 2 }
    case 'towards_short':  return { short: w.short + 2, medium: w.medium,     long: Math.max(0, w.long - 1) }
    case 'towards_medium': return { short: Math.max(0, w.short - 1), medium: w.medium + 2, long: w.long }
    default:               return w
  }
}

function weightedPickLength(w: LengthWeights, seed: number): ImageTextLength {
  const opts: [ImageTextLength, number][] = [
    ['short',  Math.max(0, w.short)],
    ['medium', Math.max(0, w.medium)],
    ['long',   Math.max(0, w.long)],
  ]
  const total = opts.reduce((s, [, n]) => s + n, 0)
  if (total === 0) return 'short'
  const pick = ((seed % total) + total) % total
  let acc = 0
  for (const [len, n] of opts) {
    acc += n
    if (pick < acc) return len
  }
  return 'short'
}

export function decideImageTextLength(
  theme: MacroTheme,
  format: ContentFormatType,
  seed = 0,
  lengthBias?: LengthBias,
): ImageTextLength {
  const baseWeights = FORMAT_LENGTH_WEIGHTS[format] ?? { short: 5, medium: 3, long: 2 }
  const themeBias = THEME_LENGTH_BIAS[theme] ?? 'neutral'
  const weights = applyThemeBias(baseWeights, themeBias)
  const biased: LengthWeights = {
    short:  weights.short  + (lengthBias?.short  ?? 0),
    medium: weights.medium + (lengthBias?.medium ?? 0),
    long:   weights.long   + (lengthBias?.long   ?? 0),
  }
  return weightedPickLength(biased, seed)
}

export const STYLE_BY_LENGTH: Record<ImageTextLength, VisualStyle[]> = {
  short:  ['STYLE_A', 'STYLE_D', 'STYLE_F'],
  medium: ['STYLE_A', 'STYLE_B', 'STYLE_D'],
  long:   ['STYLE_B', 'STYLE_E'],
}

const THEME_STYLE_AFFINITY: Partial<Record<MacroTheme, VisualStyle[]>> = {
  manifestacion:    ['STYLE_A', 'STYLE_B'],
  dinero:           ['STYLE_A', 'STYLE_B'],
  abundancia:       ['STYLE_A', 'STYLE_F'],
  suerte:           ['STYLE_F', 'STYLE_A'],
  oportunidades:    ['STYLE_F', 'STYLE_A'],
  rituales:         ['STYLE_D', 'STYLE_A'],
  senales:          ['STYLE_F', 'STYLE_D'],
  numeros_fechas:   ['STYLE_D', 'STYLE_F'],
  deseos_concretos: ['STYLE_A', 'STYLE_D'],
  creencias:        ['STYLE_B', 'STYLE_D'],
  merecimiento:     ['STYLE_B', 'STYLE_E'],
  desapego:         ['STYLE_E', 'STYLE_B'],
  amor_relaciones:  ['STYLE_E', 'STYLE_B'],
}

export function decideVisualStyle(
  theme: MacroTheme,
  format: ContentFormatType,
  length: ImageTextLength,
  seed = 0,
): VisualStyle {
  if (format === 'carousel')         return 'STYLE_D'
  if (format === 'method_steps')     return 'STYLE_C'
  if (format === 'reel_educational') return 'STYLE_C'
  if (format === 'affirmation')      return 'STYLE_A'

  const byLength = STYLE_BY_LENGTH[length]
  const byTheme  = THEME_STYLE_AFFINITY[theme] ?? []

  const votes = new Map<VisualStyle, number>()
  for (const s of byLength) votes.set(s, (votes.get(s) ?? 0) + 2)
  for (const s of byTheme)  votes.set(s, (votes.get(s) ?? 0) + 1)

  const pool: VisualStyle[] = []
  for (const [style, count] of votes) {
    for (let i = 0; i < count; i++) pool.push(style)
  }

  return pool[((seed % pool.length) + pool.length) % pool.length]
}

// ── GENERATORS ─────────────────────────────────────────────────────

function generateReel(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
): ReelContent {
  const base = REEL_PIECES[theme] ?? DEFAULT_REEL
  const adapter = FORMAT_ADAPTERS[format]
  const overrides: FormatOverride = adapter ? adapter(base) : {}

  const visual_style = decideVisualStyle(theme, format, 'medium')
  const result: ReelContent = {
    kind: 'reel',
    ...base,
    ...overrides,
    strategy: {
      ...base.strategy,
      objective: OBJECTIVE_LABEL[objective] ?? base.strategy.objective,
    },
    visual_style,
    visual_style_label: VISUAL_STYLE_LABELS[visual_style],
  }
  assertKindConsistency(result)
  return result
}

function generateCarouselContent(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
): CarouselContent {
  const base = CAROUSEL_PIECES[theme] ?? DEFAULT_CAROUSEL
  const visual_style = decideVisualStyle(theme, format, 'medium')
  const result: CarouselContent = {
    kind: 'carousel',
    ...base,
    strategy: {
      ...base.strategy,
      objective: OBJECTIVE_LABEL[objective] ?? base.strategy.objective,
    },
    visual_style,
    visual_style_label: VISUAL_STYLE_LABELS[visual_style],
  }
  assertKindConsistency(result)
  return result
}

function generatePost(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
  overrides?: { image_text_length?: ImageTextLength; visual_style?: VisualStyle; seed?: number; lengthBias?: LengthBias },
): PostContent {
  const base = REEL_PIECES[theme] ?? DEFAULT_REEL
  const seed = overrides?.seed ?? 0
  const image_text_length = overrides?.image_text_length ?? decideImageTextLength(theme, format, seed, overrides?.lengthBias)
  const visual_style = overrides?.visual_style ?? decideVisualStyle(theme, format, image_text_length, seed)
  const result: PostContent = {
    kind: 'post',
    strategy: {
      ...base.strategy,
      objective: OBJECTIVE_LABEL[objective] ?? base.strategy.objective,
    },
    image_text: IMAGE_TEXTS[theme]?.[image_text_length] ?? base.on_screen_text,
    image_text_length,
    caption: base.caption,
    cta: base.cta,
    hashtags: base.hashtags,
    visual_style,
    visual_style_label: VISUAL_STYLE_LABELS[visual_style],
  }
  assertKindConsistency(result)
  return result
}

export function generateMockContent(
  theme: MacroTheme,
  format: ContentFormatType,
  objective: ContentObjective,
  overrides?: { image_text_length?: ImageTextLength; visual_style?: VisualStyle; seed?: number; lengthBias?: LengthBias },
): GeneratedContent {
  const kind = FORMAT_KIND[format]
  if (kind === 'carousel') return generateCarouselContent(theme, format, objective)
  if (kind === 'post')     return generatePost(theme, format, objective, overrides)
  return generateReel(theme, format, objective)
}

// ── EXPORTS for plan-level duplicate detection ──────────────────────
export { REEL_PIECES }
