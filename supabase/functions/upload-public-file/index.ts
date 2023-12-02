// @ts-ignore
import { serve } from 'std/server';
import { decode } from 'base64-arraybuffer';
import { connect } from '../_shared/helpers.ts';
import { uniqueId } from '../_shared/upload-utils.ts';

const MAX_SIZE = 3_000_000; // roughly 0.8MB

serve(async (req: Request) => {
  return await connect(req, async (client, body) => {
    let { data, category, type } = body as { data: string; category: string; type: string };
    if (data.length > MAX_SIZE)
      return {
        status: 'error',
        message: 'File size too large',
      };
    if (!['png', 'jpeg', 'jpg', 'webp'].includes(type))
      return {
        status: 'error',
        message: 'Invalid type',
      };
    if (!['portraits', 'backgrounds'].includes(category))
      return {
        status: 'error',
        message: 'Invalid category',
      };

    const {
      data: { user },
    } = await client.auth.getUser();
    if (!user)
      return {
        status: 'error',
        message: 'No user found',
      };

    // const convertedImg = toArrayBuffer(await sharp(decode(data)).resize(512, 512).webp().toBuffer());

    const path = `${user.id}/${uniqueId(data, '', 0, 0)}.${type}`;
    const { data: uploadResult, error } = await client.storage
      .from(category)
      .upload(path, decode(data), {
        contentType: `image/${type}`,
      });

    const { data: urlResult } = client.storage
      .from(category)
      .getPublicUrl(error ? path : uploadResult.path);

    return {
      status: 'success',
      data: {
        url: urlResult.publicUrl,
      },
    };
  });
});
