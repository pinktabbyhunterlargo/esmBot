#include <vips/vips8>

#include "common.h"

using namespace std;
using namespace vips;

char *Reddit(string *type, char *BufferData, size_t BufferLength,
             ArgumentMap Arguments, size_t *DataSize) {
  string text = GetArgument<string>(Arguments, "text");
  string basePath = GetArgument<string>(Arguments, "basePath");

  VOption *options = VImage::option()->set("access", "sequential");

  VImage in =
      VImage::new_from_buffer(BufferData, BufferLength, "",
                              *type == "gif" ? options->set("n", -1) : options)
          .colourspace(VIPS_INTERPRETATION_sRGB);
  if (!in.has_alpha()) in = in.bandjoin(255);

  string assetPath = basePath + "assets/images/reddit.png";
  VImage tmpl = VImage::new_from_file(assetPath.c_str());

  int width = in.width();
  int pageHeight = vips_image_get_page_height(in.get_image());
  int nPages = vips_image_get_n_pages(in.get_image());

  string captionText = "<span foreground=\"white\">" + text + "</span>";

  VImage textImage = VImage::text(
      ".", VImage::option()->set(
               "fontfile", (basePath + "assets/fonts/reddit.ttf").c_str()));
  textImage = VImage::text(
      captionText.c_str(),
      VImage::option()
          ->set("rgba", true)
          ->set("font", "Roboto, Twemoji Color Font 62")
          ->set("fontfile", (basePath + "assets/fonts/twemoji.otf").c_str())
          ->set("align", VIPS_ALIGN_LOW));

  VImage composited =
      tmpl.composite2(textImage, VIPS_BLEND_MODE_OVER,
                      VImage::option()->set("x", 375)->set(
                          "y", (tmpl.height() - textImage.height()) - 64));
  VImage watermark =
      composited.resize((double)width / (double)composited.width());

  vector<VImage> img;
  for (int i = 0; i < nPages; i++) {
    VImage img_frame =
        *type == "gif" ? in.crop(0, i * pageHeight, width, pageHeight) : in;
    VImage frame = img_frame.join(watermark, VIPS_DIRECTION_VERTICAL,
                                  VImage::option()->set("expand", true));
    img.push_back(frame);
  }
  VImage final = VImage::arrayjoin(img, VImage::option()->set("across", 1));
  final.set(VIPS_META_PAGE_HEIGHT, pageHeight + watermark.height());

  void *buf;
  final.write_to_buffer(
      ("." + *type).c_str(), &buf, DataSize,
      *type == "gif" ? VImage::option()->set("dither", 0)->set("reoptimise", 1)
                     : 0);

  return (char *)buf;
}